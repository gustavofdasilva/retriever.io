<template>
    <div class="container" >
        <main>
            <div class="main-sub-container">
                <h2 class="sub-title" >Recent Downloads</h2>
                <RecentDownloadDetailedContainer style="margin-bottom: 4em;"/>
            </div>
        </main>
    </div>
</template>
<script lang="ts">
import { RouterLink } from 'vue-router';
import ActiveDownloadCard from '../components/ActiveDownloadCard.vue';
import BaseSearchBar from '../components/BaseSearchBar.vue';
import RecentDownloadCard from '../components/RecentDownloadCard.vue';
import TheHeader from '../components/TheHeader.vue';
import { addToHist, clearHist, createHistFile, readHistFile } from '../helpers/history';
import { useFSStore } from '../stores/fileSystem';
import { useMediaStore } from '../stores/media';
import { useLoadingStore } from '../stores/loading';
import { invoke } from '@tauri-apps/api/core';
import { useDownloadLogStore } from '../stores/downloadLog';
import RecentDownloadDetailedContainer from '../components/RecentDownloadDetailedContainer.vue';

    export default {
        components: {
            TheHeader,
            BaseSearchBar,
            RecentDownloadCard,
            RecentDownloadDetailedContainer,
            ActiveDownloadCard,
            RouterLink,
        },
        setup() {
            const mediaStore = useMediaStore();
            const fsStore = useFSStore();
            const loadingStore = useLoadingStore();
            const downloadLogStore = useDownloadLogStore();
            const readFile = () => readHistFile();
            const createFile = () => createHistFile();
            const addDownload = (newLog: DownloadLog) => addToHist(newLog);
            const clearInfo = () => clearHist();

            return {
                mediaStore,
                fsStore,
                loadingStore,
                downloadLogStore,
                readFile,
                createFile,
                addDownload,
                clearInfo
            }
        },
        data() {
            return {
                loadingSearch: false,
                downloadResultMsg: '',
                downloadLog: [] as DownloadLog[],
            }
        },
        mounted() {
            this.downloadLogStore.loadDownloadHistory();
        },
        methods: {

            getMetadata(inputText: string) {
                if(this.loadingStore.loading) return

                this.loadingSearch = true
                invoke('get_metadata',{url: inputText}).then((res)=>{
                    if(Array.isArray(res)) {
                        const basicMetadata = res
                        this.mediaStore.setTitle(basicMetadata[0]);
                        this.mediaStore.setChannel(basicMetadata[1]);
                        this.mediaStore.setThumbnail(basicMetadata[2]);
                        this.mediaStore.setViews(basicMetadata[3]);
                        this.mediaStore.setLikes(basicMetadata[4]);
                        this.mediaStore.setDislikes(basicMetadata[5]);
                        this.mediaStore.setDuration(basicMetadata[6]);
                        this.mediaStore.setUrl(inputText);
                        this.loadingSearch = false;
                    }
                })
            },
            async checkDownload(val: boolean){
                this.downloadResultMsg = val ? 'Download successful!' : 'Could not download'
                setTimeout(()=>{
                    this.downloadResultMsg = ''
                },2000)

                if(val) {
                    const activeDownloadLog:DownloadLog = {
                        thumbnailUrl: this.mediaStore.getThumbnail,
                        title: this.mediaStore.getTitle,
                        channel: this.mediaStore.getChannel,
                        format: this.mediaStore.getFormat ? this.mediaStore.getFormat : "Video",
                        quality: this.mediaStore.getQuality,
                        length: this.mediaStore.getDuration,
                        path: this.fsStore.getDefaultOutput,
                        dateCreated: new Date()
                    } 

                    await this.addDownload(activeDownloadLog);
                    await this.downloadLogStore.loadDownloadHistory();
                    this.mediaStore.reset();
                }
            },
            
        }
    }
</script>
<style scoped lang="scss">
    .sub-title{
        margin: 2em 0 0.6em 0;
        font-size: 1.5em;
        font-weight: bold ;
        align-self: flex-start;
    }

    .container {
        min-height: 88vh;
        background-color: var(--black-background-850);
        background-image: url(../assets/bg-simple-1.svg);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        position: relative;
    }

    .main-sub-container {
        display: flex;
        align-items: center;
        justify-content: start;
        flex-direction: column;
        width: 100%;
        min-height: 80vh;
    }

    .search-sub-container{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        transition: all .2s ease;
    }


    .loader {
        position: absolute;
        z-index: 1;
        top: 50%;
        width: 50px;
        aspect-ratio: 1;
        border-radius: 50%;
        background: 
            radial-gradient(farthest-side,var(--red-stroke) 94%,#0000) top/8px 8px no-repeat,
            conic-gradient(#0000 30%,var(--red-stroke));
        -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 8px),#000 0);
        animation: l13 1s infinite linear;
        }
        @keyframes l13{ 
        100%{transform: rotate(1turn)}
    }

    main {
        min-height: 87.7%;
        margin: auto;
        width: 55%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: all .2s ease;

        @media screen and (max-width: 820px) {
            width: 85%;
            transition: all .2s ease;
        }
    }

    p {
        color: var(--black-background-600);
        font-size: 0.86em;
        margin-top: 0.3em;
    }

    
</style>