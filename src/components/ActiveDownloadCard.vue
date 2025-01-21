<template>
    <div class="active-card-container" :style="style">
        <div>
        <Toast position="bottom-right" group="downloadProgress" @close="closeDownloadProgressToast">
            <template #container="{ message, closeCallback }">
                <div class="download-toast" >
                    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                    <Button style="position: absolute; right: 1em; top: 1em;" icon="pi pi-times" @click="toggle" variant="text" size="medium" severity="secondary" />
                    <p style="font-weight: 600; font-size: 1.1em;">Download progress</p>
                    <p v-if="loadingStore.getDownloadInfo != ''" style="font-weight: 400; font-size: .8em; color: var(--surface-500) ; margin-bottom: .9em; width: 80%;">Info: {{ loadingStore.getDownloadInfo }}</p>
                    <ProgressBar :mode="loadingStore.getDownloadProgress == '' ? 'inderteminate' : 'determinate'" :value="Number(loadingStore.getDownloadProgress)" />
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
                    <p style="margin-right: 1em;" >Format</p>
                    <div >
                        <Select v-model="format" :options="formats" optionLabel="name" placeholder="Format" class="w-full md:w-56" 
                            @change="(event)=>{
                                qualities = event.value.name == 'Audio' ? audioQualities : videoQualities;
                                console.log(qualities);
                            }" />
                    </div>
                </div>

                <div class="options-subcontainer">
                    <p style="margin-right: 1em;" >Quality</p>
                    <div >
                        <Select v-model="quality" :options="qualities" optionLabel="name" placeholder="Quality" class="w-full md:w-56" :disabled="format==''" />
                    </div>
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
import { useLoadingStore } from '../stores/loading';
import Toast from 'primevue/toast';
import ProgressBar from 'primevue/progressbar';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import { audioQualities, videoQualities } from '../constants/qualities';
import { formats } from '../constants/fileExtensions';

    export default {
        components: {
            Toast,
            ProgressBar,
            Select,
            Button,
            Menu
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
            const mediaStore = useMediaStore()
            const fsStore = useFSStore()
            const loadingStore = useLoadingStore()

            return { 
                mediaStore,
                fsStore,
                loadingStore
            }
        },
        methods: {
            download() {
                this.loading=true
                const fileType = this.format.code == "Audio" ? 'mp3' : 'mp4';
                const output = `${this.fsStore.getDefaultOutput}/${this.mediaStore.getTitle}`
                
                this.getProgressInfo();
                invoke('download',{
                    url: this.mediaStore.getUrl, 
                    output: output, 
                    format: this.format.code, 
                    fileExt: fileType,
                    quality: this.quality.code,
                    startSection: "",
                    endSection: "",
                    goalFileSize: "100",
                    thumbnailPath: "",
                }).then(()=>{

                    this.mediaStore.setFormat(this.format.code)
                    this.mediaStore.setQuality(this.quality.name);
                    
                    this.newNotification("Download successful!");
                    this.$emit('download-successful',true,length);
                }).catch((err)=>{
                    this.newNotification("Something went wrong :(");
                    console.log(err)
                    this.$emit('download-successful',false)
                }).finally(()=>{
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
            exit() {
                this.mediaStore.reset();
            },
            closeDownloadProgressToast() {
                this.$toast.removeGroup("downloadProgress");
            },
            downloadProgressToast() {
                this.$toast.add({ severity: 'secondary', summary: 'Uploading your files.', group: 'downloadProgress'});
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
        width: 50%;
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
        align-items: flex-start;
        align-self: center;
        justify-content: space-between;
        width: 100%;
    }
        .button-w-title-container h1 {
            width: 80%;
            text-align: start;
        }

    
</style>