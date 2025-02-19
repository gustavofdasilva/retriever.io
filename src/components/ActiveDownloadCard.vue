<template>
    <div class="active-card-container" :style="style">
        <div class="thumbnail" :style="{backgroundImage: 'url('+mediaStore.getThumbnail+')'}"></div>
        <div class="metadata">
            <div class="button-w-title-container">
                <h1 style="font-size: 1.5em;">{{mediaStore.getTitle}}</h1>
                <Button icon="pi pi-times" @click="()=>{exit()}" variant="text" size="large" severity="secondary" />
            </div>
            <p style="font-size: 1em; color:var(--black-background-600); margin: .2em 0 .6em 0;">{{mediaStore.getChannel}}</p>
            <div class="options-container">
                <div class="options-subcontainer" style="margin-right: 2em;">    
                    <FloatLabel style="width: 100%;" fluid variant="on">
                        <label style="z-index: 1;" for="format_dropdown">Format</label>    
                        <Select fluid inputId="format_dropdown" style="width: 100%;" v-model="format" :options="formats" optionLabel="name"
                            @change="(event:SelectChangeEvent)=>{
                                qualities = event.value.name == 'Audio' ? audioQualities.map(item=>item.name) : videoQualities.map(item=>item.name);
                                quality = '';
                            }" />
                    </FloatLabel>
                    <Message v-if="(missingInfo && !format.code)" style="align-self: flex-start;" severity="error" size="small" variant="simple">Select format</Message>
                </div>

                <div class="options-subcontainer">
                    <div >
                        <FloatLabel variant="on">
                            <label style="z-index: 1;" for="quality_dropdown">Quality</label>
                            <AutoComplete fluid inputId="quality_dropdown" v-model="quality" dropdown :suggestions="qualities" @complete="search" />
                        </FloatLabel>
                        <Message v-if="(missingInfo && quality == '')"  style="align-self: flex-start;" severity="error" size="small" variant="simple">Select quality</Message>
                    </div>
                </div>
                
            </div>
            <Button style="width: 100%; margin-top: .8em;" label="Download" severity="primary" @click="()=>{download()}" />
            
        </div>
    </div>
</template>
<script lang="ts">
import { invoke } from '@tauri-apps/api/core';
import { useMediaStore } from '../stores/media';
import { useFSStore } from '../stores/fileSystem';
import { useLoadingStore } from '../stores/loading';
import Toast from 'primevue/toast';
import ProgressBar from 'primevue/progressbar';
import Select, { SelectChangeEvent } from 'primevue/select';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import { audioQualities, videoQualities } from '../constants/qualities';
import { formats } from '../constants/fileExtensions';
import { useUserConfig } from '../stores/userConfig';
import AutoComplete, { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import FloatLabel from 'primevue/floatlabel';
import { findConfigCode } from '../helpers/download';
import { findAccount } from '../helpers/accounts';
import { addToHist } from '../helpers/history';
import { useDownloadLogStore } from '../stores/downloadLog';
import Message from 'primevue/message';

    export default {
        components: {
            Toast,
            ProgressBar,
            Select,
            Button,
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
                format: {} as BaseOption,
                formats:formats,
                videoQualities: videoQualities,
                audioQualities: audioQualities,
                filteredQualities:[],
                qualities:[] as string[],
                quality: '',
                missingInfo: false,
            }
        },
        setup() {
            const mediaStore = useMediaStore()
            const fsStore = useFSStore()
            const loadingStore = useLoadingStore()
            const userConfig = useUserConfig();
            const downloadLog = useDownloadLogStore();

            return { 
                mediaStore,
                fsStore,
                loadingStore,
                userConfig,
                downloadLog
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
            search(event:AutoCompleteCompleteEvent) {
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
            download() {
                if(!this.checkInputsCompleted()) {
                    this.missingInfo = true
                    this.newNotification('Alert','Missing video information',3000)
                    return
                }

                this.missingInfo = false;

                const defaultFileName = this.userConfig.getUserConfig.defaultFileName;
                const defaultOutput = this.userConfig.getUserConfig.defaultOutput;
                const defaultAudioFormat = this.userConfig.getUserConfig.defaultAudioFormat;
                const defaultVideoFormat = this.userConfig.getUserConfig.defaultVideoFormat;
                const fileType = this.format.code == "Audio" ? defaultAudioFormat.replace('.','') : defaultVideoFormat.replace('.','');
                const output = `${defaultOutput}/${defaultFileName}`

                const enabledAuth = this.userConfig.getUserConfig.authentication.enabled;
                const cookiesFromBrowser = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesFromBrowser: "";
                const cookiesTxtFilePath = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesTxtFilePath: "";
                const username = enabledAuth ? findAccount(this.mediaStore.getUrl)?.username : '';
                const password = enabledAuth ? findAccount(this.mediaStore.getUrl)?.password : '';
                
                this.loadingStore.addActiveDownload({
                    id: '', // id will be overwritten by a autoincremented id when pushing to active downloads array 
                    thumbnailUrl: this.mediaStore.getThumbnail,
                    title: this.mediaStore.getTitle,
                    channel: this.mediaStore.getChannel,
                    format: this.format.code as "Video" | "Audio",
                    quality: this.quality,
                    length: this.mediaStore.getDuration,
                    path: this.userConfig.getUserConfig.defaultOutput,
                    dateCreated: new Date(),
                    cancelled: false,
                    info: '',
                    progress: '',
                    loading: false,
                    url: this.mediaStore.getUrl, 
                    output: output, 
                    fileExt: fileType,
                    resolution: this.format.code == "Video" ? findConfigCode(this.quality, videoQualities) : "",
                    bitrate: this.format.code == "Audio" ? findConfigCode(this.quality, audioQualities) : "",
                    startSection: "",
                    endSection: "",
                    thumbnailPath: "",
                    username: username ?? "",
                    password: password ?? "",
                    cookiesFromBrowser: cookiesFromBrowser,
                    cookiesTxtFilePath: cookiesTxtFilePath,
                })
                this.$router.push('/downloads');
                this.newNotification('Download log', 'URL added to queue',3000);
            },
            exit() {
                this.mediaStore.reset();
            },
            closeDownloadProgressToast(id: string) {
                //Needs refactor
                const toast = document.getElementById(`DOWNLOAD_TOAST_${id}`) //! Workaround to remove only the toast related to the download
                if(!toast) return
                if(!toast.parentElement) return

                toast.parentElement.remove();
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
            toggle(event: any) {
                //@ts-ignore
                this.$refs.menu.toggle(event);
            }
        }
    }

</script>

<style scoped>
    .download-toast {
        margin: 1.5em 1.2em;
    }

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
    }

    .thumbnail {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        height: 100%;
        width: 45%;
        margin-right: 1em;
        border-radius: 8px;
    }
    
    .metadata {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        width: 70%;
    }

    p {
        font-size: 0.92em;
    }

    .options-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: .5em 0;
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