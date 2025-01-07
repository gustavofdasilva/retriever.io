<template>
    <div class="search-bar-container">
        <input v-model="inputText" type="text" name="text" id="text" placeholder="Paste your url...">
        <BaseIconButton :disabled="disabled" btnIcon="search" :btnBorder="true" style="position: absolute; right: 10px;" :onClickFunc="()=>{getMetadata()}" />
    </div>
</template>
<script>
import { invoke } from '@tauri-apps/api/core';
import BaseIconButton from './BaseIconButton.vue';
import { useMediaStore } from '../stores/media';
import { useLoadingStore } from '../stores/loading';
import { info } from '@tauri-apps/plugin-log';

export default {
    components: {
        BaseIconButton
    },
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            inputText: '',
            basicMetadata: ''
        }
    },
    setup() {
      const mediaStore = useMediaStore()  
      const loadingStore = useLoadingStore()

      return {
        mediaStore,
        loadingStore
      }
    },
    methods: {
        getMetadata() {
            console.log(this.disabled)
            if(this.loadingStore.loading) return
            this.$emit('start-loading')
            invoke('get_metadata',{url: this.inputText}).then((res)=>{
                if(Array.isArray(res)) {
                    this.basicMetadata = res
                    this.mediaStore.setTitle(this.basicMetadata[0]);
                    this.mediaStore.setChannel(this.basicMetadata[1]);
                    this.mediaStore.setThumbnail(this.basicMetadata[2]);
                    this.mediaStore.setViews(this.basicMetadata[3]);
                    this.mediaStore.setLikes(this.basicMetadata[4]);
                    this.mediaStore.setDislikes(this.basicMetadata[5]);
                    this.mediaStore.setDuration(this.basicMetadata[6]);
                    this.mediaStore.setUrl(this.inputText);
                    this.$emit('end-loading')
                }
            })
        }
        
    }
}
</script>
<style scoped>
    .search-bar-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
    }

    input {
        width: 100%;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: 10px;
        padding: 0.9em 1em;
        color: var(--white-text);
        outline: none;
    }
</style>