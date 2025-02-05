<template>
    <div class="active-card-container" :style="style">
        <div>
        <Toast position="bottom-right" group="downloadProgress" @close="closeDownloadProgressToast">
            <template  #container="">
                <div class="download-toast" >
                    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                    <Button style="position: absolute; right: 1em; top: 1em;" icon="pi pi-times" @click="toggle" variant="text" severity="secondary" />
                    <p style="font-weight: 600; font-size: 1.1em;">Download progress</p>
                    <p v-if="loadingStore.getDownloadInfo != ''" style="font-weight: 400; font-size: .8em; color: var(--surface-500) ; margin-bottom: .9em; width: 80%;">Info: {{ loadingStore.getDownloadInfo }}</p>
                    <ProgressBar :mode="loadingStore.getDownloadProgress == '' ? 'indeterminate' : 'determinate'" :value="Number(loadingStore.getDownloadProgress)" />
                </div>
            </template>
        </Toast>
        </div>
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
                </div>

                <div class="options-subcontainer">
                    <div >
                        <FloatLabel variant="on">
                            <label style="z-index: 1;" for="quality_dropdown">Quality</label>
                            <AutoComplete fluid inputId="quality_dropdown" v-model="quality" dropdown :suggestions="qualities" @complete="search" />
                        </FloatLabel>
                    </div>
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

    export default {
        components: {
            Toast,
            ProgressBar,
            Select,
            Button,
            Menu,
            AutoComplete,
            FloatLabel
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
                items: [
                    {
                        label: 'Cancel download',
                        icon: 'pi pi-undo',
                        command: () => {
                            this.killProcess()
                        },
                        class: 'alert'
                    }
                ]
            }
        },
        setup() {
            const mediaStore = useMediaStore()
            const fsStore = useFSStore()
            const loadingStore = useLoadingStore()
            const userConfig = useUserConfig();

            return { 
                mediaStore,
                fsStore,
                loadingStore,
                userConfig
            }
        },
        methods: {
            killProcess() {
                this.cancelled=true;
                let intervalCount=0;
                const intervalId = setInterval(()=>{
                    intervalCount++;

                    if(intervalCount >= 5) {
                        clearInterval(intervalId);
                    }

                    invoke('kill_active_process');
                },500)

                
                this.newNotification("Download cancelled",3000);
                this.loading = false
                this.loadingStore.setDownloadProgress('');
                this.loadingStore.setDownloadInfo('');
                this.closeDownloadProgressToast();
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
                this.loading=true
                const defaultFileName = this.userConfig.getUserConfig.defaultFileName;
                const defaultOutput = this.userConfig.getUserConfig.defaultOutput;
                const defaultAudioFormat = this.userConfig.getUserConfig.defaultAudioFormat;
                const defaultVideoFormat = this.userConfig.getUserConfig.defaultVideoFormat;
                const fileType = this.format.code == "Audio" ? defaultAudioFormat.replace('.','') : defaultVideoFormat.replace('.','');
                const output = `${defaultOutput}/${defaultFileName}`

                const enabledAuth = this.userConfig.getUserConfig.authentication.enabled;
                const cookiesFromBrowser = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesFromBrowser: "";
                const cookiesTxtFilePath = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesTxtFilePath: "";
                const username = enabledAuth ? findAccount(this.mediaStore.getUrl)?.username ?? {} as Account : '';
                const password = enabledAuth ? findAccount(this.mediaStore.getUrl)?.password ?? {} as Account : '';
                
                this.getProgressInfo();
                invoke('download',{
                    url: this.mediaStore.getUrl, 
                    output: output, 
                    format: this.format.code, 
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
                }).then((response: any)=>{
                    if(this.cancelled) {
                        this.cancelled =false;
                        return 
                    }

                    if (response.error && response.error != "") {
                        const errorIndex = response.error.indexOf("ERROR:");
                        const errorOnly = response.error.substring(errorIndex);
                        this.newNotification(`${errorOnly}`,10000);
                        this.loading = false;
                        return;
                    }
                    
                    console.log(response);

                    const outputFullPath = response.output.split('\\')
                    const outputName = outputFullPath[outputFullPath.length-1];

                    this.mediaStore.setFormat(this.format.code as "Video" | "Audio")
                    this.mediaStore.setQuality(this.quality);
                    this.mediaStore.setTitle(outputName);
                    
                    this.newNotification("Download successful!",3000);
                    this.$emit('download-successful',true,length);
                }).catch((err)=>{
                    if(this.cancelled) {
                        this.cancelled =false;
                        return 
                    }

                    this.newNotification("Something went wrong :(",3000);
                    console.log(err)
                    this.$emit('download-successful',false)
                }).finally(()=>{
                    if(this.cancelled) {
                        this.cancelled =false;
                        return 
                    }

                    this.loading = false
                    this.loadingStore.setDownloadProgress('');
                    this.loadingStore.setDownloadInfo('');
                    this.closeDownloadProgressToast();
                })
            },
            getProgressInfo() {
                this.downloadProgressToast();
                const loadProgress = setInterval(()=>{
                    if (this.loading) {
                        invoke('get_progress_info').then((res:any)=>{
                            if(res == "") return

                            this.loadingStore.setDownloadInfo(res);
                            try {
                                let progressValue = res.match(/(\d+\.\d+)%/g)[0].replace("%",'');
                                this.loadingStore.setDownloadProgress(progressValue);
                            } catch (error) {
                                
                            }
                        })
                    } else {
                        clearInterval(loadProgress);
                    }
                },1000)
                
            },
            exit() {
                this.mediaStore.reset();
            },
            closeDownloadProgressToast() {
                this.$toast.removeGroup("downloadProgress");
            },
            downloadProgressToast() {
                console.log("DOWNLOAD TOAST");
                this.$toast.add({ 
                    severity: 'secondary', 
                    summary: 'Uploading your files.', 
                    group: 'downloadProgress'});
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