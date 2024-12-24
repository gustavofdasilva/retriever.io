<template>
    <div class="container" >
        <main>

            <div v-if="false" style="width: 100px;">
                <button @click="createFile" >Create file</button>
                <button @click="readFile; loadDownloadHistory()" >Read file</button>
                <button @click="addDownload(mockDownloadLog)" >Add download</button>
                <button @click="clearInfo()" >Clear history</button>
            </div>
            <div class="main-sub-container">
                <div class="loader" :style="[ loadingSearch ? {opacity: '1'} : {opacity:'0'}]" ></div>
                <div class="search-sub-container" :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]">
                    <BaseSearchBar
                        :disabled="loadingSearch"
                        @start-loading="()=>{loadingSearch = true}"
                        @end-loading="()=>{loadingSearch = false}"  />
                    <template v-if="mediaStore.getTitle == ''">
                        <p style="padding-top: 1em;"><a href="/">Detailed download</a> if you need more options</p>
                        <p><a href="/">Multiple download</a> if you need many downloads</p>
                    </template>
                </div>
                <template v-if="mediaStore.getTitle != ''" :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]" >
                    <ActiveDownloadCard
                        :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]"
                        @download-successful="(val:boolean)=>{checkDownload(val)}"
                    />
                    <p>{{ downloadResultMsg }}</p>
                </template>
            </div>

            <div style="width: 100%; margin-top: 4em;">
                <h2 class="sub-title" >Recent Downloads</h2>
                
                <RecentDownloadCard v-for="download in downloadLog"
                    :thumbnail-url="download.thumbnailUrl"
                    :title="download.title" 
                    :channel="download.channel" 
                    :quality="download.quality" 
                    :format="download.format" 
                    :length="download.length"/>
                
                <p v-if="downloadLog.length==0" style="text-align: center; margin-top: 2em;">No recent downloads found. Start retrieving!</p>
            </div>
        </main>
    </div>
</template>
<script lang="ts">
import ActiveDownloadCard from '../components/ActiveDownloadCard.vue';
import BaseSearchBar from '../components/BaseSearchBar.vue';
import RecentDownloadCard from '../components/RecentDownloadCard.vue';
import TheHeader from '../components/TheHeader.vue';
import { addToHist, clearHist, createHistFile, readHistFile } from '../helpers/history';
import { useFSStore } from '../stores/fileSystem';
import { useMediaStore } from '../stores/media';

    export default {
        components: {
            TheHeader,
            BaseSearchBar,
            RecentDownloadCard,
            ActiveDownloadCard
        },
        setup() {
            const mediaStore = useMediaStore();
            const fsStore = useFSStore();
            const readFile = () => readHistFile();
            const createFile = () => createHistFile();
            const addDownload = (newLog: DownloadLog) => addToHist(newLog);
            const clearInfo = () => clearHist();

            return {
                mediaStore,
                fsStore,
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
                mockDownloadLog: {
                    title: 'Video Title',
                    channel: 'Channel',
                    quality: '1080p',
                    format: 'Video' ,
                    length: 1600,
                    path: 'C:/Users/Gusta'
                } as DownloadLog
            }
        },
        mounted() {
            this.loadDownloadHistory();
        },
        methods: {
            async loadDownloadHistory() {
                this.readFile().then((downloadArr: DownloadLog[] | null)=>{
                    if(downloadArr != null) {
                        this.downloadLog = downloadArr
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
                        format: this.mediaStore.getFormat,
                        quality: this.mediaStore.getQuality,
                        length: 0,
                        path: this.fsStore.getDefaultOutput
                    } 

                    await this.addDownload(activeDownloadLog);
                    await this.loadDownloadHistory();
                    this.mediaStore.reset();
                }
            },
            
        }
    }
</script>
<style scoped>
    .sub-title{
        margin: 2em 0 0.6em 0;
        font-size: 1.5em;
        font-weight: bold ;
        align-self: flex-start;
    }

    .container {
        min-height: 100vh;
        background-color: var(--black-background-850);
        background-image: url(../assets/bg-simple-1.svg);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }

    .main-sub-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        margin-top: 25vh;
        height: 30vh;
        width: 100%;
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
    }

    p {
        color: var(--black-background-600);
        font-size: 0.86em;
        margin-top: 0.3em;
    }

    
</style>