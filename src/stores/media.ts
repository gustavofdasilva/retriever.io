import { defineStore } from "pinia";

export const useMediaStore = defineStore("media", {
    state: () =>({title:'',channel:'',thumbnail:'',url:''}),
    getters: {
        getTitle: (state)=>state.title,
        getChannel: (state)=>state.channel,
        getThumbnail: (state)=>state.thumbnail,
        getUrl: (state)=>state.url    
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
        reset() {
            this.title = '';
            this.channel = '';
            this.thumbnail = '';
            this.url = '';
        }
    }
})