import { defineStore } from "pinia";
import { useUserConfig } from "./userConfig";
import { download } from "../helpers/download";

export const useLoadingStore = defineStore("loading", {
    state: () =>({
        loading: false, 
        activeDownloadProgress: '',
        activeDownloadInfo: '',
        summarizedToastVisible: false,
        activeDownloads: [] as DownloadInProgress[],
        pendingDownloads: [] as DownloadInProgress[],
        autoIncrementId: 0,
    }),
    getters: {
        getLoading: (state)=>state.loading,
        getDownloadProgress: (state)=>state.activeDownloadProgress,
        getDownloadInfo: (state)=>state.activeDownloadInfo,
        getActiveDownloads: (state)=>state.activeDownloads,
        getPendingDownloads: (state)=>state.pendingDownloads,
        getSummarizedToastVisible: (state)=>state.summarizedToastVisible,
        getActiveDownloadsCount: (state)=>state.activeDownloads.length,
        getActiveDownloadById: (state) => {
            return (id:string)=>state.activeDownloads.find((download)=>download.id===id);
        },
        getPendingDownloadById: (state) => {
            return (id:string)=>state.pendingDownloads.find((download)=>download.id===id);
        },
        getAutoincrementId: (state) => state.autoIncrementId
    },
    actions: {
        setLoading(newLoading: boolean) {
            this.loading = newLoading
        },
        setSummarizedToastVisible(newSummarizedToastVisible: boolean) {
            this.summarizedToastVisible = newSummarizedToastVisible;
        },
        setDownloadProgress(newDownloadProgress: string) {
            this.activeDownloadProgress = newDownloadProgress
        },
        setDownloadInfo(newDownloadInfo: string) {
            this.activeDownloadInfo = newDownloadInfo
        },
        addActiveDownload(newActiveDownload: DownloadInProgress): string { // return index
            const concurrentDownloads = (useUserConfig().getUserConfig.downloads.concurrentDownloads??0) <= 0 ? 1 : (useUserConfig().getUserConfig.downloads.concurrentDownloads??0)
            let id: string;
            const newDownload = {...newActiveDownload};

            if(newActiveDownload.id == '') {
                this.autoIncrementId++;
                id = String(this.autoIncrementId)

                newDownload.id = id;
            } else {
                id = newActiveDownload.id;
            }
            

            if(!this.loading) {
                this.loading = true;
            }

            if( this.activeDownloads.length >= concurrentDownloads) {
                this.pendingDownloads.push(newDownload);
            } else {
                this.activeDownloads.push(newDownload);
                download(newDownload);
            }

            return id;
        },
        setActiveDownloadById<K extends keyof DownloadInProgress>(id: string, keys: K[], values: DownloadInProgress[K][]) {
            this.activeDownloads = this.activeDownloads.map((download)=>{
                if(download.id == id) {
                    for (let i = 0; i < keys.length; i++) {
                        download[keys[i]] = values[i];
                    }
                    return download
                } 
                return download
            })            
        },
        removeActiveDownloadById(id: string) {
            const concurrentDownloads = (useUserConfig().getUserConfig.downloads.concurrentDownloads??0) <= 0 ? 1 : (useUserConfig().getUserConfig.downloads.concurrentDownloads??0)
            this.activeDownloads = this.activeDownloads.filter((download)=>{
                return download.id != id;
            })

            if(this.activeDownloads.length == 0 && this.pendingDownloads.length == 0) {
                this.loading = false;
                if(useUserConfig().getUserConfig.interface.showDownloadProgressNotification == "Summarized") {
                    closeDownloadProgressToastSummarized();
                    this.summarizedToastVisible = false;
                }
            }

            if( this.activeDownloads.length < concurrentDownloads) {
                const newDownload = this.pendingDownloads.shift();

                if(!newDownload) return

                this.addActiveDownload(newDownload)
            }
        },
        removePendingDownloadById(id: string) {
            this.pendingDownloads = this.pendingDownloads.filter((download)=>{
                return download.id != id;
            })
        }
    }
})

function closeDownloadProgressToastSummarized() {
    //!Needs refactor
    const toast = document.getElementById(`DOWNLOAD_TOAST_SUMMARIZED`) //! Workaround to remove only the toast related to the download
    if(!toast) return
    if(!toast.parentElement) return

    toast.parentElement.remove();
}