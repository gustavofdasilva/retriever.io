import { defineStore } from "pinia";

export const useUserConfig = defineStore("userConfig", {
    state: () =>({
        defaultOutput: '',
        defaultFileName: '',
        defaultAudioFormat: '',
        defaultVideoFormat: '',
    }),
    getters: {
        getDefaultOutput: (state)=>state.defaultOutput,
        getDefaultFileName: (state)=>state.defaultFileName,
        getDefaultAudioFormat: (state)=>state.defaultAudioFormat,
        getDefaultVideoFormat: (state)=>state.defaultVideoFormat,
        getUserConfig: (state)=>({
            defaultOutput: state.defaultOutput,
            defaultFileName: state.defaultFileName,
            defaultAudioFormat: state.defaultAudioFormat,
            defaultVideoFormat: state.defaultVideoFormat
        } as UserConfig)
    },
    actions: {
        setDefaultOutput(newDefaultOutput: string) {
            this.defaultOutput = newDefaultOutput
        },
        setDefaultFileName(newDefaultFileName: string) {
            this.defaultFileName = newDefaultFileName
        },
        setDefaultAudioFormat(newDefaultAudioFormat: string) {
            this.defaultAudioFormat = newDefaultAudioFormat
        },
        setDefaultVideoFormat(newDefaultVideoFormat: string) {
            this.defaultVideoFormat = newDefaultVideoFormat
        },
        setUserConfig(userConfig: UserConfig) {
            this.defaultOutput = userConfig.defaultOutput
            this.defaultFileName = userConfig.defaultFileName
            this.defaultAudioFormat = userConfig.defaultAudioFormat
            this.defaultVideoFormat = userConfig.defaultVideoFormat
        }
    }
})