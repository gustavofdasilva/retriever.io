<template>
    <div class="container" >
        <main>
            <div class="main-sub-container">
                <div class="loader" :style="[ loadingSearch ? {opacity: '1'} : {opacity:'0'}]" ></div>
                <div class="search-sub-container" :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]">
                    <BaseSearchBar
                        :rows="mediaStore.getMultiUrls.length == 0 ? 5 : 3"
                        :disabled="loadingSearch"
                        :multiline="true"
                        @on-click-func="prepareDownload"/>
                    <template v-if="mediaStore.getMultiUrls.length == 0">
                        <p style="padding-top: 1em;"><RouterLink to="/">Home</RouterLink> if you need it simple</p>
                        <p><RouterLink to="/multiple" >Multiple download</RouterLink> if you need multiple, but simple</p>
                    </template>
                </div>
                <template v-if="mediaStore.getMultiUrls.length != 0" :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]" >
                    <ActiveDownloadCardMultipleDetailed
                        :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]"
                        @download-successful="(val:boolean)=>{checkDownload(val)}"
                    />
                </template>
            </div>
        </main>
    </div>
</template>
<script lang="ts">
import { RouterLink } from 'vue-router';
import BaseSearchBar from '../components/BaseSearchBar.vue';
import RecentDownloadCard from '../components/RecentDownloadCard.vue';
import TheHeader from '../components/TheHeader.vue';
import { addToHist, clearHist, createHistFile, readHistFile } from '../helpers/history';
import { useFSStore } from '../stores/fileSystem';
import { useMediaStore } from '../stores/media';
import { useDownloadLogStore } from '../stores/downloadLog';
import RecentDownloadContainer from '../components/RecentDownloadContainer.vue';
import ActiveDownloadCardMultipleDetailed from '../components/ActiveDownloadCardMultipleDetailed.vue';

    export default {
        components: {
            TheHeader,
            BaseSearchBar,
            RecentDownloadCard,
            ActiveDownloadCardMultipleDetailed,
            RouterLink,
            RecentDownloadContainer
        },
        setup() {
            const mediaStore = useMediaStore();
            const fsStore = useFSStore();
            const downloadLogStore = useDownloadLogStore();
            const readFile = () => readHistFile();
            const createFile = () => createHistFile();
            const addDownload = (newLog: DownloadLog) => addToHist(newLog);
            const clearInfo = () => clearHist();

            return {
                mediaStore,
                fsStore,
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

            prepareDownload(inputText: string) {
                if(inputText=='') return;
                const arr = inputText.split("\n");
                
                const urlsArray = arr.filter((link)=>{
                    console.log(/^https:\/\/www\.[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/g.test(link))
                    return /^https:\/\/.[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/g.test(link)
                })

                if (urlsArray.length == 0) {
                    this.newNotification('Error', 'No valid urls selected',3000);
                }
                
                this.mediaStore.setMultiUrls(urlsArray.filter(item=>item!=""))
            },
            newNotification(summary: string, message: string, life: number) {
                this.$toast.add({
                    severity: 'secondary',
                    summary: summary,
                    detail: message,
                    life: life,
                    closable: true
                })
            },

            async checkDownload(val: boolean){
                this.downloadResultMsg = val ? 'Download successful!' : 'Could not download'
                setTimeout(()=>{
                    this.downloadResultMsg = ''
                },2000)

                console.log(this.downloadResultMsg)

                if(val) {
                    await this.downloadLogStore.loadDownloadHistory();
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
        min-height: 88vh;
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
        margin-top: 10vh;
        min-height: 78vh;
        width: 100%;
        padding-bottom: 2em;
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