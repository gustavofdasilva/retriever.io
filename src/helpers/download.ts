//the file extensions, bitrate and resolution options array are similar. They are arrays of objects with a name and a code property. 

import { invoke } from "@tauri-apps/api/core";
import { useLoadingStore } from "../stores/loading";
import { addToHist } from "./history";
import toasteventbus from "primevue/toasteventbus";
import { audioQualities, videoQualities } from "../constants/qualities";

// The findConfigCode function is used to send the selected info formatted to the backend
export const findConfigCode = (name: string, arr: YTDLPOptions): string => {
    return arr.find((el) => el.name === name)?.code ?? '';
}

export const findConfigName = (code: string, arr: YTDLPOptions): string => {
    return arr.find((el) => el.code === code)?.name ?? '';
}

export const checkFormat = (value: string): string => {
    
    if (value == "aac" ||
    value == "alac" ||
    value == "flac" ||
    value == "m4a" ||
    value == "mp3" ||
    value == "opus" ||
    value == "vorbis" ||
    value == "wav") {
        return 'Audio'
    }

    return 'Video'
}

export const download = (download: DownloadInProgress) => {
    const loadingStore = useLoadingStore();
    loadingStore.setActiveDownloadById(download.id,
        ['loading'],[true]
    )
    getProgressInfo(download.id);
    invoke('download',download).then((response: any)=>{
        if(loadingStore.getActiveDownloadById(download.id)?.cancelled) {
            loadingStore.setActiveDownloadById(download.id,
                ['cancelled'],
                [false],
            )
            return 
        }
        
        if (response.error && response.error != "") {
            const errorIndex = response.error.indexOf("ERROR:");
            const errorOnly = response.error.substring(errorIndex);
            newNotification(`${errorOnly}`,10000);

            return;
        }

        const outputFullPath = response.output.split('\\')
        const outputName = outputFullPath[outputFullPath.length-1];

        let startTime, endTime;
        if(download.startSection.split(":").length == 2) {
            startTime = `00:${download.startSection}`
        } else if (download.startSection.split(":").length == 1) {
            startTime = `00:00:${download.startSection}`
        } else {
            startTime = "00:00"
        }

        if(download.endSection.split(":").length == 2) {
            endTime = `00:${download.endSection}`
        } else if (download.endSection.split(":").length == 1) {
            endTime = `00:00:${download.endSection}`
        } else {
            endTime = "00:00"
        }

        let length = timeDifference(startTime,endTime);
        let lengthSplitted = length.split(":");

        if(lengthSplitted[0]=="00") {
            lengthSplitted.shift();
            length = lengthSplitted.join(':');
        }

        const resName = findConfigName(download.resolution,videoQualities)
        const bitrateName = findConfigName(download.bitrate,audioQualities)
        let quality:string = `${resName}/${bitrateName}`;

        if(resName == '' || bitrateName == '') {
            quality = resName == '' ? `${bitrateName}` : `${resName}`
        }
        
        const activeDownloadLog:DownloadLog = {
            thumbnailUrl: download.thumbnailUrl,
            title: outputName,
            channel: download.channel,
            format: download.format ? download.format : "Video",
            quality: quality,
            length: length == "00:00" ? download.length : length, 
            path: download.path,
            dateCreated: new Date()
        } 

        addToHist(activeDownloadLog);

        newNotification("Download successful!",3000);
    }).catch((err)=>{
        console.log(err)
        if(loadingStore.getActiveDownloadById(download.id)?.cancelled) {
                loadingStore.setActiveDownloadById(download.id,
                    ['cancelled'],
                    [false],
                )
                return 
        }


        newNotification("Something went wrong :(",3000);
    }).finally(()=>{
        closeDownloadProgressToast(download.id);
        if(loadingStore.getActiveDownloadById(download.id)?.cancelled) {
            loadingStore.setActiveDownloadById(download.id,
                ['cancelled'],
                [false],
            )
            return 
        }

        loadingStore.setActiveDownloadById(download.id,
        ['loading'],[false]);
        loadingStore.removeActiveDownloadById(download.id);
    })
}


function closeDownloadProgressToast(id: string) {
    //!Needs refactor
    const toast = document.getElementById(`DOWNLOAD_TOAST_${id}`) //! Workaround to remove only the toast related to the download
    if(!toast) return
    if(!toast.parentElement) return

    toast.parentElement.remove();
}

function timeDifference(start:string, end:string) {
    function timeInSeconds(time:string) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }

    const startTime = timeInSeconds(start);
    const endTime = timeInSeconds(end);

    let difference = Math.abs(endTime - startTime);

    const hours = Math.floor(difference / 3600);
    difference %= 3600;
    const minutes = Math.floor(difference / 60);
    const seconds = difference % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function newNotification(message: string, life: number) {
    toasteventbus.emit('add', {
        severity: 'secondary',
        summary: 'Download log',
        detail: message,
        life: life,
        closable: true
    })
}

function getProgressInfo(id: string) {
    const loadingStore = useLoadingStore();
    const download = loadingStore.getActiveDownloadById(id)

    if(!download) return

    downloadProgressToast(id);
    const loadProgress = setInterval(()=>{
        if (download.loading) {
            invoke('get_progress_info',{downloadId: id}).then((res:any)=>{
                if(res == "") return

                loadingStore.setActiveDownloadById(
                    id,
                    ['info'],
                    [res])
                ;
                try {
                    let progressValue = res.match(/(\d+\.\d+)%/g)[0].replace("%",'')
                    loadingStore.setActiveDownloadById(
                        id,
                        ['progress'],
                        [progressValue])
                    ;
                } catch (error) {}
            })
        } else {
            clearInterval(loadProgress);
        }
    },1000)
}

function downloadProgressToast(id: string) {
    console.log("TOAST EMIT DOWNLOAD TOAST")
    toasteventbus.emit('add', { 
        severity: 'secondary', 
        summary: id, 
        group: 'downloadProgress'});
}