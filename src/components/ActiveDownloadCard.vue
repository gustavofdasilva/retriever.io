<template>
    <div class="active-card-container">
        <div class="thumbnail" :style="{backgroundImage: 'url('+mediaStore.getThumbnail+')'}"></div>
        <div class="metadata">
            <h1 style="font-size: 1.5em;">{{mediaStore.getTitle}}</h1>
            <p style="font-size: 1em; color:var(--black-background-600)">{{mediaStore.getChannel}}</p>

            <BaseButton btnClass="red" text="Download" style="width: 100%; margin-top: 1em;" :onClickFunc="()=>{download()}" />
        </div>
    </div>
</template>
<script>
import { invoke } from '@tauri-apps/api/core';
import { useMediaStore } from '../stores/media';
import BaseButton from './BaseButton.vue';
import BaseIconButton from './BaseIconButton.vue';


    export default {
        components: {
            BaseIconButton,
            BaseButton
        },
        setup() {
            const mediaStore = useMediaStore()

            return { 
                mediaStore
            }
        },
        methods: {
            download() {
                invoke('download',{url: this.mediaStore.getUrl})
            }
        }
    }

</script>

<style scoped>
    .active-card-container {
        max-width: 100%;
        min-width: 90%;
        height: 12.5em;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        border-radius: 8px;
        padding: 0.5em 1em;
        margin: 0.5em 0.5em;
    }

    .thumbnail {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        height: 85%;
        width: 15em;
        border-radius: 8px;
    }
    
    .metadata {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        width: 70%;
        height: 80%;
        padding-left: 1em;
    }

    p {
        font-size: 0.92em;
    }
    
</style>