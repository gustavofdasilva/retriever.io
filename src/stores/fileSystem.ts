import { defineStore } from "pinia";

export const useFSStore = defineStore("fileSystem", {
    state: () =>({defaultOutput: ''}),
    getters: {
        getDefaultOutput: (state)=>state.defaultOutput,
    },
    actions: {
        setDefaultOutput(newDefaultOutput: string) {
            this.defaultOutput = newDefaultOutput
        }
    }
})