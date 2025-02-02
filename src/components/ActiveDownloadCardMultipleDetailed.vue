<template>
    <div class="active-card-container" :style="style">
        <div>
        <Toast position="bottom-right" group="downloadProgress" @close="closeDownloadProgressToast">
            <template #container="{ message, closeCallback }">
                <div class="download-toast" style="margin: 1.5em 1.2em;" >
                    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                    <Button style="position: absolute; right: 1em; top: 1em;" icon="pi pi-times" @click="toggle" variant="text" size="medium" severity="secondary" />
                    <p style="font-weight: 600; font-size: 1.1em;">Download progress</p>
                    <p v-if="loadingStore.getDownloadInfo != ''" style="font-weight: 400; font-size: .8em; color: var(--surface-500) ; width: 80%;">Video: {{ videoIndex+1 }} / {{ mediaStore.getMultiUrls.length }}</p>
                    <p v-if="loadingStore.getDownloadInfo != ''" style="font-weight: 400; font-size: .8em; color: var(--surface-500) ; width: 80%;">Info: {{ loadingStore.getDownloadInfo }}</p>
                    <ProgressBar style="margin-top: .9em; " :mode="loadingStore.getDownloadProgress == '' ? 'indeterminate' : 'determinate'" :value="Number(loadingStore.getDownloadProgress)" />
                </div>
            </template>
        </Toast>
        </div>
        <div class="thumbnail">
            <p style="font-size: 2em; font-weight: 500;" >{{ mediaStore.getMultiUrls.length }}</p>
        </div>
        <div class="metadata">
            <div class="button-w-title-container" style="margin-bottom: -2em;">
                <h1 style="font-size: 1.5em;">{{mediaStore.getMultiUrls.length}} Videos selected</h1>
                <Button icon="pi pi-times" @click="()=>{exit()}" variant="text" size="large" severity="secondary" />
            </div>
            <p style="font-size: 1em; color:var(--black-background-600); margin: .2em 0 .6em 0;">{{mediaStore.getChannel}}</p>
            <h2>Output file</h2>
            <div class="options-container">

                <div class="options-subcontainer">
                    <FloatLabel style="width: 100%;" fluid variant="on">
                    <label style="z-index: 1;" for="file_ext_dropdown">File type</label>    
                    <!-- <Select fluid inputId="file_ext_dropdown" style="width: 100%;" v-model="fileExt" :options="fileExts" optionLabel="name"/> -->
                    <AutoComplete  fluid inputId="file_ext_dropdown" v-model="fileExt" dropdown :suggestions="filteredFileExts" @complete="searchFileExt" />
                    </FloatLabel>
                </div>

                <div class="options-subcontainer">
                    <FloatLabel variant="on">
                        <label style="z-index: 1;" for="resolution_dropdown">Resolution</label>
                        <AutoComplete fluid inputId="resolution_dropdown" v-model="resolution" dropdown :suggestions="filteredVideoQualities" @complete="searchResolution" />
                    </FloatLabel>
                </div>

                <div class="options-subcontainer">
                    <FloatLabel variant="on">
                        <label style="z-index: 1;" for="bitrate_dropdown">Bitrate</label>
                        <AutoComplete  fluid inputId="bitrate_dropdown" v-model="bitrate" dropdown :suggestions="filteredAudioQualities" @complete="searchBitrate" />
                    </FloatLabel>
                </div>
                
            </div>

            <h2>Output path</h2>
            <div style="width: 100%; padding: 0 1em;">

                <BaseFileInput
                    :key="outputPath"
                    :path="outputPath == '' ? fsStore.getDefaultOutput : outputPath"
                    @folder-selected="setOutputPath"
                    style="width: 100%; justify-content: flex-start; font-size: .9em;"
                />
            </div>

            <div style="display: flex; align-items: center; margin-top: 2em; margin-bottom: 1em;">
                <h2 style="margin: 0;">File name</h2> <span v-tooltip="'Template name all videos will follow in their file'" style="margin-left: .8em;" class="pi pi-info-circle"></span>
            </div>
            <div class="fileName">
                <aside style="z-index: 100; margin-right: 1em;">{{ fileExt }}</aside>
                <AutoComplete class="suggestions-input" v-model="fileName" :showEmptyMessage="false" :suggestions="filteredVariables" @complete="search" 
                    :pt="{
                        root(root) {
                            root.instance.onOptionSelect = (event, option) => {
                                let optionArray = Array.from(option)
                                const varValue = variables.find(el=>el.label==option)

                                for (let i = 0; i < optionArray.length; i++) {
                                    const fragmentedString = optionArray.slice(0,i+1).join('').toLowerCase()
                                    if(fileName.toLowerCase().endsWith(fragmentedString)) {
                                        fileName = fileName.slice(0,-(i+1))
                                        fileName += varValue?.value ?? option;
                                        return
                                    }
                                }

                                fileName+=varValue?.value??option;
                                
                            }
                        },
                    }"
                />
            </div>
            <Message style="margin-left: 1em;" v-if="!fileName.match(/%\([^)]+\)/g) && fileName != ''" severity="error" size="small" variant="simple">The file name needs to contain variables to prevent files with same name</Message>

            <!--Div Var connected to some input-->

            

            <div style="margin-top: 2em; width: 100%; ">
                <div style="display: flex; align-items: center; ">
                    <h2 style="margin-top:.7em;">Trim</h2> <!--Tool tip too-->
                    <ToggleSwitch style="margin-left: .8em;" v-tooltip="'Select video range'" v-model="trim" />
                </div>
                <template v-if="trim" >
                    <div style="width: 100%;">
                        <div class="double-input" style="justify-content: center;">
                            <p style="margin-right: 1.2em; font-weight: 600;">Range:</p>
                            <p style="margin-right: .8em;">Start</p>
                            <input placeholder="Start" type="text" name="start" id="start" v-model="range.start">
                            <p style="margin-right: .8em; margin-left: .5em;">Finish</p>
                            <input placeholder="Finish" type="text" name="finish" id="finish" v-model="range.end">
                        </div>
                    </div>
                </template>
            </div>

            <div class="thumbnail-container">
                <div style="display: flex; align-items: center; ">
                    <h2 style="margin-top:.7em;">Thumbnail</h2> <!--Tool tip too-->
                    <ToggleSwitch style="margin-left: .8em;" v-tooltip="'Download thumbnail?'" v-model="thumbnail.download" />
                </div>
                <template v-if="thumbnail.download" >
                    <h2 style="margin-top: .5em;">File name</h2>
                    <div style="width: 100%; padding: 0 1em;">
                        <InputText v-model="thumbnail.fileName" type="text" name="thumbfilename" id="thumbfilename" style="width: 100%;"/>
                    </div>
                </template>
            </div>

            <Button style="width: 100%;" :disabled="loading || !checkFields" label="Download" severity="primary" @click="()=>{if(!loading){download()}}" />
        </div>
    </div>
</template>
<script>
import { invoke } from '@tauri-apps/api/core';
import { useMediaStore } from '../stores/media';
import { useFSStore } from '../stores/fileSystem';
import BaseFileInput from './BaseFileInput.vue';
import AutoComplete from 'primevue/autocomplete';
import ytdlpVariables from '../constants/ytdlpVariables';
import VueFeather from 'vue-feather'
import Toast from 'primevue/toast';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import { useLoadingStore } from '../stores/loading';
import ProgressBar from 'primevue/progressbar';
import Menu from 'primevue/menu';
import { audioQualities, videoQualities } from '../constants/qualities';
import { fileExtensions } from '../constants/fileExtensions';
import FloatLabel from 'primevue/floatlabel';
import { checkFormat, findConfigCode } from '../helpers/download';
import Message from 'primevue/message';
import { addToHist, clearHist, createHistFile, readHistFile } from '../helpers/history';


    export default {
        components: {
            BaseFileInput,
            AutoComplete,
            VueFeather,
            Select,
            InputText,
            ToggleSwitch,
            Button,
            ProgressBar,
            Toast,
            Menu,
            FloatLabel,
            Message
        },
        props: {
            style: Object
        },
        data() {
            return {
                loading: false,
                cancelled: false,
                // format: '',
                // formats:[
                //     {label:"Audio (mp3)",value:"Audio"},
                //     {label:"Video (mp4)",value:"Video"},
                // ],
                audioQualities: audioQualities,
                filteredAudioQualities: [],
                videoQualities: videoQualities,
                filteredVideoQualities: [],
                fileExts: fileExtensions,
                filteredFileExts: [],
                range: {
                    start: '00:00',
                    finish: '0',
                },
                resolution: '1080p',
                bitrate: '128kbps',
                fileExt:'',
                fileName:'',
                variables: ytdlpVariables,
                toastVisible: false,
                filteredVariables: [],
                outputPath: '',
                thumbnail: {
                    download: false,
                    fileName: 'thumbnail',
                },
                trim: false,
                items: [
                    {
                        label: 'Cancel download',
                        icon: 'pi pi-undo',
                        command: () => {
                            this.killProcess()
                        },
                        class: 'alert'
                    }
                ]
            }
        },
        setup() {
            const mediaStore = useMediaStore()
            const fsStore = useFSStore()
            const loadingStore = useLoadingStore()
            const readFile = () => readHistFile();
            const createFile = () => createHistFile();
            const addDownload = (newLog) => addToHist(newLog);
            const clearInfo = () => clearHist();

            return { 
                mediaStore,
                fsStore,
                loadingStore,
                readFile,
                createFile,
                addDownload,
                clearInfo
            }
        },
        mounted() {
            this.range.end = this.mediaStore.getDuration
        },
        methods: {
            killProcess() {
                this.cancelled=true;
                let intervalCount=0;
                const intervalId = setInterval(()=>{
                    intervalCount++;

                    if(intervalCount >= 10) {
                        clearInterval(intervalId);
                    }

                    invoke('kill_active_process');
                },500)

                
                this.newNotification("Download cancelled",3000);
                this.loading = false
                this.loadingStore.setDownloadProgress('');
                this.loadingStore.setDownloadInfo('');
                this.closeDownloadProgressToast();
            },
            searchResolution(event) {
                this.filteredVideoQualities = event.query ? this.videoQualities.filter((resolution) => {
                    return resolution.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): this.videoQualities.map((item)=>item.name);
            },
            searchBitrate(event) {
                this.filteredAudioQualities = event.query ? this.audioQualities.filter((bitrate) => {
                    return bitrate.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): this.audioQualities.map((item)=>item.name);
            },
            searchFileExt(event) {
                this.filteredFileExts = event.query ? this.fileExts.filter((exts) => {
                    return exts.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): this.fileExts.map((item)=>item.name);
            },
            timeDifference(start, end) {
                function timeInSeconds(time) {
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
            },
            formatNumber(num) {
                if (num >= 1000000000) {
                    return (num / 1000000000).toFixed(1) + 'b';  // Para números acima de 1 bilhão
                } else if (num >= 1000000) {
                    return (num / 1000000).toFixed(1) + 'm';    // Para números acima de 1 milhão
                } else if (num >= 1000) {
                    return (num / 1000).toFixed(1) + 'k';      // Para números acima de 1 mil
                } else {
                    return num.toString();                     // Para números abaixo de 1 mil
                }
            },
            search(event) {
                setTimeout(() => {
                    const querySplit = event.query.split(/[-._ ]/g)
                    const queryValue = querySplit[querySplit.length-1]
                    if (!event.query.trim().length) {
                        this.filteredVariables = [];
                    } else {
                        this.filteredVariables = this.variables.filter((variable) => {
                            return variable.label.toLowerCase().startsWith(queryValue.toLowerCase()) || variable.value == queryValue;
                        }).map(val=>val.label);
                    }
                }, 250);
            },
            setOutputPath(path) {
                this.outputPath = path;
            },
            closeDownloadProgressToast() {
                this.$toast.removeGroup("downloadProgress");
                this.toastVisible=false;
            },
            async download() {
                this.loading=true
                const fileExtCode = findConfigCode(this.fileExt, fileExtensions)
                
                let fileType = checkFormat(fileExtCode);

                this.getProgressInfo();
                for (const url of this.mediaStore.getMultiUrls) {
                    
                    const videoData = await this.getMetadata(url)
                    if(!videoData) {
                        return
                    }

                    const fileExt = fileExtCode.includes('any') ? 'any' : fileExtCode
                    const outputPath = this.outputPath == '' ? this.fsStore.getDefaultOutput : this.outputPath 
                    const output = `${outputPath}/${this.fileName == '' ? this.mediaStore.getTitle : this.fileName}`
                    const thumbnailPath = this.thumbnail.download ? `${outputPath}/${this.thumbnail.fileName}` : ""

                    this.videoIndex = this.mediaStore.getMultiUrls.indexOf(url);
                    await invoke('download',{
                        url: url, 
                        output: output, 
                        format: fileType, 
                        fileExt: fileExt,
                        resolution: findConfigCode(this.resolution, videoQualities),
                        bitrate:  findConfigCode(this.bitrate, audioQualities),
                        startSection: this.trim ? this.range.start : '',
                        endSection: this.trim ? this.range.end : '',
                        thumbnailPath:thumbnailPath,
                    }).then(async(response)=>{
                        if(this.cancelled) {
                            this.cancelled =false;
                            return 
                        }

                        if (response.error && response.error != "") {
                            const errorIndex = response.error.indexOf("ERROR:");
                            const errorOnly = response.error.substring(errorIndex);
                            this.newNotification(`${errorOnly}`,10000);
                            this.loading = false;
                            return;
                        }

                        const outputFullPath = response.output.split('\\')
                        const outputName = outputFullPath[outputFullPath.length-1];

                        let startTime, endTime;
                        if(this.range.start.split(":").length == 2) {
                            startTime = `00:${this.range.start}`
                        } else if (this.range.start.split(":").length == 1) {
                            startTime = `00:00:${this.range.start}`
                        }

                        if(this.range.end.split(":").length == 2) {
                            endTime = `00:${this.range.end}`
                        } else if (this.range.end.split(":").length == 1) {
                            endTime = `00:00:${this.range.end}`
                        }

                        let length = this.timeDifference(startTime,endTime);
                        let lengthSplitted = length.split(":");

                        if(lengthSplitted[0]=="00") {
                            lengthSplitted.shift();
                            length = lengthSplitted.join(':');
                        }
                    
                        const activeDownloadLog = {
                            thumbnailUrl: videoData.thumbnail,
                            title: outputName,
                            channel: videoData.channel,
                            format: fileType,
                            quality: `${this.resolution}/${this.bitrate}`,
                            length: length == "00:00" ? videoData.duration : length,
                            path: outputPath,
                            dateCreated: new Date()
                        } 
    
                        await this.addDownload(activeDownloadLog);

                        this.newNotification("Download successful!",3000);
                    }).finally(()=>{
                        if(this.cancelled) {
                            this.cancelled =false;
                            return 
                        }
                        this.$emit('download-successful',true);
                        const index = this.mediaStore.getMultiUrls.indexOf(url);
                        const length = this.mediaStore.getMultiUrls.length;

                        this.loadingStore.setDownloadProgress('');
                        this.loadingStore.setDownloadInfo('');

                        if (index+1 == length) {
                            this.loading = false;
                            this.closeDownloadProgressToast();
                            this.$router.push('/downloads')
                            this.mediaStore.reset()
                        }
                    })
                }
            },
            async getMetadata(url) {
                const res = await invoke('get_metadata',{url: url})
                if (res.error && res.error != "") {
                    const errorIndex = res.error.indexOf("ERROR:");
                    const errorOnly = res.error.substring(errorIndex);
                    this.newNotification(`${errorOnly}`,10000);
                    this.loading = false;
                    return null;
                }

                return {
                    title: res.title,
                    channel: res.channel,
                    thumbnail: res.thumbnail,
                    duration: res.duration,
                }
            },
            getProgressInfo() {
                this.downloadProgressToast();
                const loadProgress = setInterval(()=>{
                    if (this.loading) {
                        invoke('get_progress_info').then((res)=>{
                            if(res == "") return

                            this.loadingStore.setDownloadInfo(res);
                            try {
                                let progressValue = res.match(/(\d+\.\d+)%/g)[0].replace("%",'');
                                this.loadingStore.setDownloadProgress(progressValue);
                            } catch (error) {
                                
                            }
                        })
                    } else {
                        clearInterval(loadProgress);
                    }
                },1000)
                
            },
            checkFields() {
                return !(this.fileExt == '' || this.resolution == '' || this.bitrate == '' || this.outputPath == '' || this.fileName == '');
            },
            exit() {
                this.mediaStore.reset();
            },
            downloadProgressToast() {
                if(!this.toastVisible) {
                    this.$toast.add({ severity: 'secondary', summary: 'Uploading your files.', group: 'downloadProgress'});
                    this.toastVisible = true;
                } 
            },
            newNotification(message,life) {
                this.$toast.add({
                    severity: 'secondary',
                    summary: 'Download log',
                    detail: message,
                    life: life,
                    closable: true
                })
            },
            toggle(event) {
                this.$refs.menu.toggle(event);
            }

        }
    }

</script>

<style scoped>
        
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }

    input[type=number] {
    -moz-appearance: textfield;
    }

    .active-card-container {
        width: 100%;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
        border-radius: var(--p-form-field-border-radius);
        padding: 1.5em 1em;
        margin: 0.5em 0.5em;
        position: relative;
    }

    .thumbnail {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        background-color: var(--black-background-850);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 5em;
        width: 100%;
        margin-right: 1em;
        margin-bottom: 1.2em;
        border-radius: var(--p-form-field-border-radius);
    }
    
    .metadata {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        height: 80%;
    }

    h2 {
        font-weight: 600;
        font-size: 1.2em;
        margin-bottom: .5em;
        margin-top: 2.5em;
    }

    p {
        font-size: 0.92em;
    }

    input {
        background: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        padding: .4em .9em;
        outline: none;
        transition: all ease .2s;
    }
        
        input:focus, input:hover {
            border-color: var(--black-background-700);
            transition: all ease .2s;
        }

    .options-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: .5em 0;
        padding: 0 1em;
    }

    .media-info {
        border: 1px solid var(--black-background-800); 
        border-radius: var(--p-form-field-border-radius);
        padding: .5em 1em;
        margin: .7em 0 0 0;
        display: flex;
        align-items: center;
    }
        .media-info p {
            font-size: 1em;
            margin-left: .5em;
        }

        .media-info div {
            display: flex;
            align-items: center;
        }

    .double-input {
        display: flex;
        align-items: center;
    }

    .double-input input {
        max-width: 4.5em;
        text-align: center;
        margin-right: 1em;
    }

    .fileName {
        width: 100%; 
        padding: 0 1em; 
        height: 100%;
        position: relative;
    }
        .fileName aside {
            position: absolute; 
            top: 50%; 
            transform: translate(0,-50%); 
            right: 40px; 
            color: var(--white-text);
        }


    .options-container .options-subcontainer:not(:last-child) {
        margin-right: 1.5em;
        width: 100%;
    }

    .options-subcontainer {
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        flex: 1;
    }

        .options-subcontainer p {
            white-space: nowrap;
            margin-right: 1em;
        }
        
    .button-w-title-container {
        display: flex;
        align-items: flex-start;
        align-self: center;
        justify-content: space-between;
        width: 100%;
    }
        .button-w-title-container h1 {
            width: 80%;
            text-align: start;
        }

    .thumbnail-container {
        margin: 2em 0;
        width: 100%;
    }
    
</style>