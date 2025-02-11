import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
    state: () =>({
        loading: false, 
        activeDownloadProgress: '',
        activeDownloadInfo: '',
        activeDownloads: [] as DownloadInProgress[],
        autoIncrementId: 0,
    }),
    getters: {
        getLoading: (state)=>state.loading,
        getDownloadProgress: (state)=>state.activeDownloadProgress,
        getDownloadInfo: (state)=>state.activeDownloadInfo,
        getActiveDownloads: (state)=>state.activeDownloads,
        getActiveDownloadsCount: (state)=>state.activeDownloads.length,
        getActiveDownloadById: (state) => {
            return (id:string)=>state.activeDownloads.find((download)=>download.id===id);
        },
        getAutoincrementId: (state) => state.autoIncrementId
    },
    actions: {
        setLoading(newLoading: boolean) {
            this.loading = newLoading
        },
        setDownloadProgress(newDownloadProgress: string) {
            this.activeDownloadProgress = newDownloadProgress
        },
        setDownloadInfo(newDownloadInfo: string) {
            this.activeDownloadInfo = newDownloadInfo
        },
        addActiveDownload(newActiveDownload: DownloadInProgress): string { // return index
            this.autoIncrementId++;
            const id = String(this.autoIncrementId);
            const newDownload = {...newActiveDownload};
            newDownload.id = id;

            this.activeDownloads.push(newDownload);
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
            this.activeDownloads = this.activeDownloads.filter((download)=>{
                return download.id != id;
            })
        }
    }
})