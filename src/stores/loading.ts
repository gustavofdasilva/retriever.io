import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
    state: () =>({loading: false, activeDownloadProgress: ''}),
    getters: {
        getLoading: (state)=>state.loading,
        getDownloadProgress: (state)=>state.activeDownloadProgress
    },
    actions: {
        setLoading(newLoading: boolean) {
            this.loading = newLoading
        },
        setDownloadProgress(newDownloadProgress: string) {
            this.activeDownloadProgress = newDownloadProgress
        }
    }
})