import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
    state: () =>({
        loading: false, 
        activeDownloadProgress: '',
        activeDownloadInfo: '',
    }),
    getters: {
        getLoading: (state)=>state.loading,
        getDownloadProgress: (state)=>state.activeDownloadProgress,
        getDownloadInfo: (state)=>state.activeDownloadInfo
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
        }
    }
})