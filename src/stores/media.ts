import { defineStore } from "pinia";

export const useMediaStore = defineStore("media", {
    state: () =>({
            title:'',
            channel:'',
            thumbnail:'',
            url:'',
            format:'' as "Video" | "Audio" | null,
            quality:'',
            dateCreated: new Date() as Date | null,
            views:null as number | null | "NA",
            likes:null as number | null | "NA",
            dislikes:null as number | null | "NA",
            duration:"",

        }),
    getters: {
        getTitle: (state)=>state.title,
        getChannel: (state)=>state.channel,
        getThumbnail: (state)=>state.thumbnail,
        getViews: (state)=>state.views,
        getLikes: (state)=>state.likes,
        getDislikes: (state)=>state.dislikes,
        getUrl: (state)=>state.url,    
        getFormat: (state)=>state.format,
        getQuality: (state)=>state.quality,
        getDateCreated: (state)=>state.dateCreated,
        getDuration: (state)=>state.duration,
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
        setViews(newViews: number) {
            this.views = newViews
        },
        setLikes(newLikes: number) {
            this.likes = newLikes
        },
        setDislikes(newDislikes: number) {
            this.dislikes = newDislikes
        },
        setDuration(newDuration: string) {
            this.duration = newDuration
        },
        setUrl(newUrl: string) {
            this.url= newUrl
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
            this.views = null,
            this.likes = null,
            this.dislikes = null,
            this.duration="",
            this.format = null;
            this.quality = '';
            this.dateCreated = null
        }
    }
})