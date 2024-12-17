<template>
    <div class="search-bar-container">
        <input v-model="inputText" type="text" name="text" id="text" placeholder="Paste your url...">
        <BaseIconButton btnIcon="search" :btnBorder="true" style="position: absolute; right: 10px;" :onClickFunc="()=>{getMetadata()}" />
    </div>
</template>
<script>
import { invoke } from '@tauri-apps/api/core';
import BaseIconButton from './BaseIconButton.vue';
import { defineStore } from 'pinia';
import { useMediaStore } from '../stores/media';
import { useLoadingStore } from '../stores/loading';

export default {
    components: {
        BaseIconButton
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
            this.$emit('start-loading')
            invoke('get_metadata',{url: this.inputText}).then((res)=>{
                if(Array.isArray(res)) {
                    this.basicMetadata = res
                    this.mediaStore.setTitle(this.basicMetadata[0]);
                    this.mediaStore.setChannel(this.basicMetadata[1]);
                    this.mediaStore.setThumbnail(this.basicMetadata[2]);
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