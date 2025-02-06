import { defineStore } from "pinia";
import { changeConfig, getEmptyUserConfig } from "../helpers/userConfig";

const emptyUser = {
    defaultOutput: '',
    defaultFileName: '%(title)s',
    defaultAudioFormat: '.mp3',
    defaultVideoFormat: '.mp4',
    authentication: {
        enabled: false,
        cookiesFromBrowser: '',
        cookiesTxtFilePath: '',
    },
    keepUpToDate: {
        ytDlp: true,
        ffmpeg: true,
    },
    downloads: {
        concurrentDownloads: 1,
        disablePartFiles: false,
        downloadRateLimit: null,
        enableSponsorBlock: null,
        fileAccessRetries: null,
        numberOfRetries: null,
        restrictFilename: false,
        trimFilename: null
    },
    enableSystemNotification: false,
    metadata: {
        downloadDescriptionInFileDefault: false,
        downloadSubtitlesInFile: {
            enabled: false,
            lang: '',
            type: 'Normal'
        },
        downloadThumbnailByDefault: null,
        downloadVideoAnnotations: false,
    },
    postProcessing: {
        embedChaptersInVideo: false,
        embedSubtitles: {
            enabled: false,
            lang: ''
        },
        embedThumbnailCoverArt: false,
    }
}

export const useUserConfig = defineStore("userConfig", {
    state: () =>({
        userConfig: {} as UserConfig
    }),
    getters: {
            getUserConfig: (state)=>{
                return {
                ...emptyUser,
                ...state.userConfig
            } as UserConfig}
    },
    actions: {
        async setUserConfigField<K extends keyof UserConfig>(config: K, value: UserConfig[K]) {
            this.userConfig[config] = value;
            await changeConfig(config,value);
        },
        async setUserConfig(userConfig: UserConfig) {
            this.userConfig = userConfig;
            for(const [key,value] of Object.entries(userConfig)) {
                await changeConfig(key as keyof UserConfig, value)
            }
        }
    }
})