import { defineStore } from "pinia";

export const useMediaStore = defineStore("media", {
    state: () =>({title:'',channel:'',thumbnail:''}),
    getters: {
        getTitle: (state)=>state.title,
        getChannel: (state)=>state.channel,
        getThumbnail: (state)=>state.thumbnail    
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
        }
    }
})