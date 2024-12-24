import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
    state: () =>({loading: false}),
    getters: {
        getLoading: (state)=>state.loading,
    },
    actions: {
        setLoading(newLoading: boolean) {
            this.loading = newLoading
        }
    }
})