<template>
    <div class="container" >
        <main>
            <div class="main-sub-container">
                <div class="loader" :style="[ loadingSearch ? {opacity: '1'} : {opacity:'0'}]" ></div>
                <div class="search-sub-container" :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]">
                    <BaseSearchBar
                        :disabled="loadingSearch"
                        @on-click-func="getMetadata"
                        @start-loading="()=>{loadingSearch = true}"
                        @end-loading="()=>{loadingSearch = false}"  />
                    <template v-if="mediaStore.getTitle == ''">
                        <p style="padding-top: 1em;"><RouterLink to="/singleDetailed" >Detailed download</RouterLink> if you need more options</p>
                        <p><RouterLink to="/multiple">Multiple download</RouterLink> if you need many downloads</p>
                    </template>
                </div>
                <template v-if="mediaStore.getTitle != ''" :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]" >
                    <ActiveDownloadCard
                        :style="[ loadingSearch ? {opacity: '0.4'} : {opacity:'1'}]"
                    />
                </template>
            </div>

            <div style="width: 100%; margin-top: 4em;">
                <h2 class="sub-title" >Recent Downloads</h2>
                
                <RecentDownloadContainer/>
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
import RecentDownloadContainer from '../components/RecentDownloadContainer.vue';
import { useDownloadLogStore } from '../stores/downloadLog';
import { findAccount } from '../helpers/accounts';
import { useUserConfig } from '../stores/userConfig';

    export default {
        components: {
            TheHeader,
            BaseSearchBar,
            RecentDownloadCard,
            RecentDownloadContainer,
            ActiveDownloadCard,
            RouterLink,
        },
        setup() {
            const mediaStore = useMediaStore();
            const fsStore = useFSStore();
            const loadingStore = useLoadingStore();
            const downloadLogStore = useDownloadLogStore();
            const userConfig = useUserConfig();
            const readFile = () => readHistFile();
            const createFile = () => createHistFile();
            const addDownload = (newLog: DownloadLog) => addToHist(newLog);
            const clearInfo = () => clearHist();

            return {
                mediaStore,
                fsStore,
                loadingStore,
                downloadLogStore,
                userConfig,
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

                this.loadingSearch = true
                const enabledAuth = this.userConfig.getUserConfig.authentication.enabled;
                const cookiesFromBrowser = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesFromBrowser: "";
                const cookiesTxtFilePath = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesTxtFilePath: "";
                let username = enabledAuth ? findAccount(inputText)?.username : '';
                let password = enabledAuth ? findAccount(inputText)?.password : '';

                if(!username || !password) {
                    username='';
                    password='';
                }

                console.log(username,password);
                invoke('get_metadata',{
                    url: inputText, 
                    username: username,
                    password: password,
                    cookiesFromBrowser: cookiesFromBrowser,
                    cookiesTxtFilePath: cookiesTxtFilePath,
                }).then((res: any)=>{

                    if (res.error && res.error != "") {
                        const errorIndex = res.error.indexOf("ERROR:");
                        const errorOnly = res.error.substring(errorIndex);
                        this.newNotification(`${errorOnly}`,10000);
                        this.loadingSearch = false;
                        return;
                    }

                    this.mediaStore.setTitle(res.title);

                    if(res.channel != "NA") {
                        this.mediaStore.setChannel(res.channel);
                    } else if (res.uploader != "NA"){
                        this.mediaStore.setChannel(res.uploader);
                    } else if (res.creator != "NA") {
                        this.mediaStore.setChannel(res.creator);
                    } else {this.mediaStore.setChannel("NA");}

                    this.mediaStore.setThumbnail(res.thumbnail);
                    this.mediaStore.setViews(res.views);
                    this.mediaStore.setLikes(res.likes);
                    this.mediaStore.setDislikes(res.dislikes);
                    this.mediaStore.setDuration(res.duration);
                    this.mediaStore.setUrl(inputText);
                    this.loadingSearch = false;
                })
            },
            newNotification(message: string, life: number) {
                this.$toast.add({
                    severity: 'secondary',
                    summary: 'Download log',
                    detail: message,
                    life: life,
                    closable: true
                })
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
        margin-top: 15vh;
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