<template>
    <div class="active-card-container" :style="style">
        <div>
        <Toast position="bottom-right" group="downloadProgress" @close="closeDownloadProgressToast">
            <template #container="{ message, closeCallback }">
                <div class="download-toast" style="margin: 1.5em 1.2em;" >
                    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                    <Button style="position: absolute; right: 1em; top: 1em;" icon="pi pi-times" @click="toggle" variant="text" size="medium" severity="secondary" />
                    <p style="font-weight: 600; font-size: 1.1em;">Download progress</p>
                    <p v-if="loadingStore.getDownloadInfo != ''" style="font-weight: 400; font-size: .8em; color: var(--surface-500) ; width: 80%;">Video: {{ videoIndex+1 }} / {{ mediaStore.getMultiUrls.length }}</p>
                    <p v-if="loadingStore.getDownloadInfo != ''" style="font-weight: 400; font-size: .8em; color: var(--surface-500) ; width: 80%;">Info: {{ loadingStore.getDownloadInfo }}</p>
                    <ProgressBar style="margin-top: .9em; " :mode="loadingStore.getDownloadProgress == '' ? 'inderteminate' : 'determinate'" :value="Number(loadingStore.getDownloadProgress)" />
                </div>
            </template>
        </Toast>
        </div>
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
                            @change="(event)=>{
                                qualities = event.value.name == 'Audio' ? audioQualities : videoQualities;
                                quality = '';
                            }" />
                    </FloatLabel>
                </div>

                <div class="options-subcontainer">
                    <FloatLabel variant="on">
                        <label style="z-index: 1;" for="quality_dropdown">Quality</label>
                        <AutoComplete :key="format" fluid inputId="quality_dropdown" v-model="quality" dropdown :suggestions="qualities" @complete="search" />
                    </FloatLabel>
                </div>
                
            </div>
            <Button style="width: 100%; margin-top: .8em;" :disabled="loading" label="Download" severity="primary" @click="()=>{if(!loading){download()}}" />
        </div>
    </div>
</template>
<script>
import { invoke } from '@tauri-apps/api/core';
import { useMediaStore } from '../stores/media';
import { useFSStore } from '../stores/fileSystem';
import { addToHist, createHistFile, readHistFile } from '../helpers/history';
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

    export default {
        components: {
            Button,
            Select,
            Toast,
            ProgressBar,
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
                format: '',
                formats:formats,
                videoQualities: videoQualities,
                audioQualities: audioQualities,
                qualities:[],
                quality: '',
                videoIndex: 0,
                toastVisible: false,
                items: [
                    {
                        label: 'Cancel download',
                        icon: 'pi pi-undo',
                        command: () => {
                            console.log("Delete file")
                        },
                        class: 'alert'
                    }
                ]
            }
        },
        setup() {
            const mediaStore = useMediaStore();
            const fsStore = useFSStore();
            const loadingStore = useLoadingStore();
            const userConfig = useUserConfig();
            const readFile = () => readHistFile();
            const createFile = () => createHistFile();
            const addDownload = (newLog) => addToHist(newLog);
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
            search(event) {
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
                this.loading=true

                const fileType = this.format.code == "Audio" ? 'mp3' : 'mp4';
                
                for (const url of this.mediaStore.getMultiUrls) {
                    
                    const videoData = await this.getMetadata(url)

                    
                    const defaultFileName = this.userConfig.getDefaultFileName;
                    const output = `${this.fsStore.getDefaultOutput}/${defaultFileName}`

                    this.getProgressInfo();
                    this.videoIndex = this.mediaStore.getMultiUrls.indexOf(url);
                    await invoke('download',{
                        url: url, 
                        output: output, 
                        format: this.format.code, 
                        fileExt: fileType,
                        resolution: this.format.code == "Video" ? findConfigCode(this.quality, videoQualities) : "",
                        bitrate: this.format.code == "Audio" ? findConfigCode(this.quality, audioQualities) : "",
                        startSection: "",
                        endSection: "",
                        thumbnailPath:"",
                    }).then(async()=>{
                    
                        const activeDownloadLog = {
                            thumbnailUrl: videoData.thumbnail,
                            title: videoData.title,
                            channel: videoData.channel,
                            format: this.format.code,
                            quality: this.quality,
                            length: videoData.duration,
                            path: this.fsStore.getDefaultOutput,
                            dateCreated: new Date()
                        } 
    
                        await this.addDownload(activeDownloadLog);

                        this.newNotification("Download successful!");
                        console.log(`VIDEO ${this.mediaStore.getMultiUrls.indexOf(url)+1} DOWNLOAD LOG SUCCESSFUL`)
                    }).finally(()=>{
                        this.$emit('download-successful',true);
                        const index = this.mediaStore.getMultiUrls.indexOf(url);
                        const length = this.mediaStore.getMultiUrls.length;

                        this.loadingStore.setDownloadProgress('');
                        this.loadingStore.setDownloadInfo('');

                        if (index+1 == length) {
                            this.loading = false;
                            this.closeDownloadProgressToast();
                            this.$router.push('/downloads')
                            this.mediaStore.reset()
                        }
                    })
                }
            },

            async getMetadata(url) {
                const res = await invoke('get_metadata',{url: url})
                if(Array.isArray(res)) {
                    const basicMetadata = res;
                    // this.mediaStore.setTitle(basicMetadata[0]);
                    // this.mediaStore.setChannel(basicMetadata[1]);
                    // this.mediaStore.setThumbnail(basicMetadata[2]);
                    // this.mediaStore.setViews(basicMetadata[3]);
                    // this.mediaStore.setLikes(basicMetadata[4]);
                    // this.mediaStore.setDislikes(basicMetadata[5]);
                    // this.mediaStore.setDuration(basicMetadata[6]);
                    // this.mediaStore.setUrl(url);

                    return {
                        title: basicMetadata[0],
                        channel: basicMetadata[1],
                        thumbnail: basicMetadata[2],
                        duration: basicMetadata[6],
                    }
                }
            },

            getProgressInfo() {
                this.downloadProgressToast();
                const loadProgress = setInterval(()=>{
                    if (this.loading) {
                        invoke('get_progress_info').then((res)=>{
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
            downloadProgressToast() {
                if(!this.toastVisible) {
                    this.$toast.add({ severity: 'secondary', summary: 'Uploading your files.', group: 'downloadProgress'});
                    this.toastVisible = true;
                } 
            },
            closeDownloadProgressToast() {
                this.$toast.removeGroup("downloadProgress");
                this.toastVisible=false;
            },
            exit() {
                this.mediaStore.reset();
            },
            newNotification(message) {
                this.$toast.add({
                    severity: 'secondary',
                    summary: 'Download log',
                    detail: message,
                    life: 3000,
                    closable: true
                })
            },
            toggle(event) {
                this.$refs.menu.toggle(event);
            }
        }
    }

</script>

<style scoped>
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
        background-color: var(--black-background-850);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 50%;
        margin-right: 1em;
        border-radius: var(--p-form-field-border-radius);
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
        margin: .5em 0 1em 0;
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