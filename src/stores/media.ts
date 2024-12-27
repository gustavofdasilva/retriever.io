import { defineStore } from "pinia";

export const useMediaStore = defineStore("media", {
    state: () =>({
            title:'',
            channel:'',
            thumbnail:'',
            url:'',
            format:'' as "Video" | "Audio",
            quality:'',
            dateCreated: new Date(),
        }),
    getters: {
        getTitle: (state)=>state.title,
        getChannel: (state)=>state.channel,
        getThumbnail: (state)=>state.thumbnail,
        getUrl: (state)=>state.url,    
        getFormat: (state)=>state.format,
        getQuality: (state)=>state.quality,
        getDateCreated: (state)=>state.dateCreated,
    },
    actions: {
        setTitle(newTitle: string) {
            this.title = newTitle
        },
        setChannel(newChannel: string) {
            this.channel = newChannel
        },
        setThumbnail(newThumbnail: string) {
            this.thumbnail = newThumbnail
        },
        setUrl(newUrl: string) {
            this.url = newUrl
        },
        setFormat(newFormat: "Video" | "Audio") {
            this.format = newFormat
        },
        setQuality(newQuality: string) {
            this.quality = newQuality
        },
        setDateCreated(newDateCreated: Date) {
            this.dateCreated = newDateCreated
        },
        reset() {
            this.title = '';
            this.channel = '';
            this.thumbnail = '';
            this.url = '';
        }
    }
})