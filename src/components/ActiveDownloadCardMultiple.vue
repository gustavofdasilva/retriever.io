<template>
    <div class="active-card-container" :style="style">
        <div class="thumbnail">
            <p style="font-size: 2em; font-weight: 500;" >{{ mediaStore.getMultiUrls.length }}</p>
        </div>
        <div class="metadata">
            <div class="button-w-title-container">
                <h1 style="font-size: 1.5em;">{{mediaStore.getMultiUrls.length}} Videos selected</h1>
                <Button icon="pi pi-times" @click="()=>{exit()}" variant="text" size="large" severity="secondary" />
            </div>
            <p style="font-size: 1em; color:var(--black-background-600); margin: .2em 0 .6em 0;">{{mediaStore.getChannel}}</p>
            <div class="options-container">
                <div class="options-subcontainer" style="margin-right: 2em;">
                    <FloatLabel style="width: 100%;" fluid variant="on">
                        <label style="z-index: 1;" for="format_dropdown">Format</label>    
                        <Select fluid inputId="format_dropdown" style="width: 100%;" v-model="format" :options="formats" optionLabel="name"
                            @change="(event:any)=>{
                                qualities = event.value.name == 'Audio' ? audioQualities.map(q => q.name) : videoQualities.map(q => q.name);
                                quality = '';
                            }" />
                    </FloatLabel>
                    <Message v-if="(missingInfo && !format.code)" style="align-self: flex-start;" severity="error" size="small" variant="simple">Select format</Message>
                </div>

                <div class="options-subcontainer">
                    <FloatLabel variant="on">
                        <label style="z-index: 1;" for="quality_dropdown">Quality</label>
                        <AutoComplete fluid inputId="quality_dropdown" v-model="quality" dropdown :suggestions="qualities" @complete="search" />
                    </FloatLabel>
                    <Message v-if="(missingInfo && quality == '')"  style="align-self: flex-start;" severity="error" size="small" variant="simple">Select quality</Message>
                </div>
                
            </div>
            <Button style="width: 100%; margin-top: .8em;" :disabled="loading" label="Download" severity="primary" @click="()=>{if(!loading){download()}}" />
        </div>
    </div>
</template>
<script lang="ts">
import { invoke } from '@tauri-apps/api/core';
import { useMediaStore } from '../stores/media';
import { useFSStore } from '../stores/fileSystem';
import { addToHist, clearHist, createHistFile, readHistFile } from '../helpers/history';
import Button from 'primevue/button';
import Select from 'primevue/select';
import Toast from 'primevue/toast';
import ProgressBar from 'primevue/progressbar';
import Menu from 'primevue/menu';
import { useLoadingStore } from '../stores/loading';
import { useUserConfig } from '../stores/userConfig';
import { audioQualities, videoQualities } from '../constants/qualities';
import { formats } from '../constants/fileExtensions';
import AutoComplete from 'primevue/autocomplete';
import FloatLabel from 'primevue/floatlabel';
import { findConfigCode } from '../helpers/download';
import { findAccount } from '../helpers/accounts';
import Message from 'primevue/message';
import { getYtDlpPath } from '../helpers/externalPrograms';

    export default {
        components: {
            Button,
            Select,
            Toast,
            ProgressBar,
            Menu,
            AutoComplete,
            FloatLabel,
            Message
        },
        props: {
            style: Object
        },
        data() {
            return {
                loading: false,
                cancelled: false,
                format: {} as YTDLPOption,
                formats:formats,
                videoQualities: videoQualities,
                audioQualities: audioQualities,
                qualities:[] as string[],
                quality: '',
                videoIndex: 0,
                toastVisible: false,
                missingInfo: false,
            }
        },
        setup() {
            const mediaStore = useMediaStore();
            const fsStore = useFSStore();
            const loadingStore = useLoadingStore();
            const userConfig = useUserConfig();
            const readFile = () => readHistFile();
            const createFile = () => createHistFile();
            const addDownload = (newLog:any) => addToHist(newLog);
            const clearInfo = () => clearHist();

            return {
                mediaStore,
                fsStore,
                loadingStore,
                userConfig,
                readFile,
                createFile,
                addDownload,
                clearInfo
            }
        },
        methods: {
            checkInputsCompleted():boolean {
                if(!this.format.code || this.quality == '' 
                ){
                    return false
                }
                return true
            },
            search(event:any) {
                if(this.format.name == 'Audio') {
                    console.log("Audio")
                    this.qualities = event.query ? this.audioQualities.filter((quality) => {
                        return quality.name.toLowerCase().includes(event.query.toLowerCase());
                    }).map((item)=>item.name): this.audioQualities.map((item)=>item.name);
                } else {
                    console.log("Video")
                    this.qualities = event.query ? this.videoQualities.filter((quality) => {
                        return quality.name.toLowerCase().includes(event.query.toLowerCase());
                    }).map((item)=>item.name): this.videoQualities.map((item)=>item.name);
                }

                console.log(this.qualities)
            },
            async download() {
                if(!this.checkInputsCompleted()) {
                    this.missingInfo = true
                    this.newNotification('Alert','Missing video information',3000)
                    return
                }

                this.missingInfo = false;

                const fileType = this.format.code == "Audio" ? 'mp3' : 'mp4';
                this.loading=true
                this.newNotification('Download log', 'URL added to queue',3000);
                this.$router.push('/downloads');
                for (const url of this.mediaStore.getMultiUrls) {
                    
                    const videoData = await this.getMetadata(url)

                    if(!videoData) {
                        return
                    }
                    this.loading = false
                    
                    const defaultFileName = this.userConfig.getUserConfig.defaultFileName;
                    const output = `${this.userConfig.getUserConfig.defaultOutput}/${defaultFileName}`
                    const enabledAuth = this.userConfig.getUserConfig.authentication.enabled;
                    const cookiesFromBrowser = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesFromBrowser: "";
                    const cookiesTxtFilePath = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesTxtFilePath: "";
                    const username = enabledAuth ? findAccount(this.mediaStore.getUrl)?.username: '';
                    const password = enabledAuth ? findAccount(this.mediaStore.getUrl)?.password: '';

                    this.loadingStore.addActiveDownload({
                        id: '', // id will be overwritten by a autoincremented id when pushing to active downloads array 
                        thumbnailUrl: videoData.thumbnail,
                        title: videoData.title,
                        channel: videoData.channel,
                        format: this.format.code as "Video" | "Audio",
                        quality: this.quality,
                        length: videoData.duration,
                        path: this.userConfig.getUserConfig.defaultOutput,
                        dateCreated: new Date(),
                        cancelled: false,
                        info: '',
                        progress: '',
                        loading: false,

                        url: url, 
                        output: output, 
                        fileExt: fileType,
                        resolution: this.format.code == "Video" ? findConfigCode(this.quality, videoQualities) : "",
                        bitrate: this.format.code == "Audio" ? findConfigCode(this.quality, audioQualities) : "",
                        startSection: "",
                        endSection: "",
                        thumbnailPath:"",
                        username: username ?? "",
                        password: password ?? "",
                        cookiesFromBrowser: cookiesFromBrowser,
                        cookiesTxtFilePath: cookiesTxtFilePath,
                    })
                }
                this.mediaStore.reset();
                
            },

            async getMetadata(url: string) {
                const enabledAuth = this.userConfig.getUserConfig.authentication.enabled;
                const cookiesFromBrowser = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesFromBrowser: "";
                const cookiesTxtFilePath = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesTxtFilePath: "";
                let username = enabledAuth ? findAccount(url)?.username : '';
                let password = enabledAuth ? findAccount(url)?.password : '';

                if(!username || !password) {
                    username='';
                    password='';
                }

                
                
                const ytDlpPath = this.userConfig.getUserConfig.customBinaries.ytDlp.enabled ? this.userConfig.getUserConfig.customBinaries.ytDlp.path : await getYtDlpPath();
                const res: any = await invoke('get_metadata',{
                    ytDlpPath,
                    url: url, 
                    username: username,
                    password: password,
                    cookiesFromBrowser: cookiesFromBrowser,
                    cookiesTxtFilePath: cookiesTxtFilePath,
                })
                if (res.error && res.error != "") {
                    const errorIndex = res.error.indexOf("ERROR:");
                    const errorOnly = res.error.substring(errorIndex);
                    this.newNotification('Error',`${errorOnly}`,10000);
                    this.loading = false;
                    return null;
                }

                return {
                    title: res.title,
                    channel: res.channel,
                    thumbnail: res.thumbnail,
                    duration: res.duration,
                }
            },
            closeDownloadProgressToast() {
                this.$toast.removeGroup("downloadProgress");
                this.toastVisible=false;
            },
            exit() {
                this.mediaStore.reset();
            },
            newNotification(summary: string, message: string, life: number) {
                this.$toast.add({
                    severity: 'secondary',
                    summary,
                    detail: message,
                    life: life,
                    closable: true
                })
            },
            toggle(event:any) {
                //@ts-ignore
                this.$refs.menu.toggle(event);
            }
        }
    }

</script>

<style scoped lang="scss">
    .active-card-container {
        width: 100%;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        border-radius: var(--p-form-field-border-radius);
        padding: 1.5em 1em;
        margin: 0.5em 0.5em;
        position: relative;
        @media screen and (max-width: 600px) {
            flex-direction: column;
        }
    }

    .thumbnail {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        background-color: var(--black-background-850);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 50%;
        margin-right: 1em;
        border-radius: var(--p-form-field-border-radius);

        
        @media screen and (max-width: 600px) {
            width: 100%;
            height: 3em;
            margin: 0 0 1em 0;
        }
    }
    
    .metadata {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        width: 70%;
        
        @media screen and (max-width: 600px) {
            width: 100%;
        }
    }

    p {
        font-size: 0.92em;
    }

    .options-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: .5em 0 1em 0;
    }

    .options-subcontainer {
        width: 100%;
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        flex-direction: column;
    }
    
    .button-w-title-container {
        display: flex;
        align-items: center;
        align-self: center;
        justify-content: space-between;
        width: 100%;
    }
        .button-w-title-container h1 {
            width: 80%;
            text-align: start;
        }

    
</style>