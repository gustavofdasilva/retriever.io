<template>
    <div class="active-card-container" :style="style">
        <div>
        <Toast position="bottom-right" group="downloadProgress" @close="closeDownloadProgressToast">
            <template #container="{ message, closeCallback }">
                <div class="download-toast" >
                    <p style="font-weight: 500; margin-bottom: .5em;">Download progress</p>
                    <ProgressBar :mode="loadingStore.getDownloadProgress == '' ? 'inderteminate' : 'determinate'" :value="loadingStore.getDownloadProgress" />
                </div>
            </template>
        </Toast>
        </div>
        <div class="thumbnail" :style="{backgroundImage: 'url('+mediaStore.getThumbnail+')'}"></div>
        <div class="metadata">
            <div class="button-w-title-container">
                <h1 style="font-size: 1.5em;">{{mediaStore.getTitle}}</h1>
                <BaseIconButton :onClickFunc="()=>{exit()}" btnIcon="x" />
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
            <BaseButton :btnClass="loading ? 'disable' : 'red'" text="Download" style="width: 100%; margin-top: 1em;" :onClickFunc="()=>{if(!loading){download()}}" />
                <!-- <BaseButton :btnClass="loading ? 'disable' : 'red'" text="Download" style="width: 100%; margin-top: 1em;" :onClickFunc="()=>{downloadProgressToast()}" /> -->
        </div>
    </div>
</template>
<script>
import { invoke } from '@tauri-apps/api/core';
import { useMediaStore } from '../stores/media';
import BaseButton from './BaseButton.vue';
import BaseIconButton from './BaseIconButton.vue';
import { useFSStore } from '../stores/fileSystem';
import { useOruga } from '@oruga-ui/oruga-next';
import { useLoadingStore } from '../stores/loading';
import Toast from 'primevue/toast';
import ProgressBar from 'primevue/progressbar';
import Select from 'primevue/select';

const oruga = useOruga();

    export default {
        components: {
            BaseIconButton,
            BaseButton,
            Toast,
            ProgressBar,
            Select
        },
        props: {
            style: Object
        },
        data() {
            return {
                loading: false,
                format: '',
                formats:[
                    {name:"Audio",code:"Audio"},
                    {name:"Video",code:"Video"},
                ],
                videoQualities: [
                    {name:'144p',code:"144p"},
                    {name:'240p',code:"240p"},
                    {name:'360p',code:"360p"},
                    {name:'720p',code:"720p"},
                    {name:'1080p',code:"1080p"},
                ],
                audioQualities: [
                    {name:'128kbps',code:"128kbps"},
                    {name:'320kbps',code:"320kbps"},
                ],
                qualities:[],
                quality: '',
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
                const fileType = this.format == "Audio" ? 'mp3' : 'mp4';
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
                    this.mediaStore.setFormat(this.format)
                    this.mediaStore.setQuality(this.quality);
                    
                    this.newNotification("Download successful!");
                    this.$emit('download-successful',true)
                }).catch((err)=>{
                    this.newNotification("Something went wrong :(");
                    console.log(err)
                    this.$emit('download-successful',false)
                }).finally(()=>{
                    this.loading = false
                    this.loadingStore.setDownloadProgress('');
                    closeDownloadProgressToast();
                })
            },
            getProgressInfo() {
                this.downloadProgressToast();
                const loadProgress = setInterval(()=>{
                    if (this.loading) {
                        invoke('get_progress_info').then((res)=>{
                            if(res == "") return
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

            },
            downloadProgressToast() {
                if (!this.visible) {
                    this.$toast.add({ severity: 'secondary', summary: 'Uploading your files.', group: 'downloadProgress'});
                    this.visible = true;
                }
            },
            newNotification(message) {
                this.$toast.add({
                    severity: 'secondary',
                    summary: 'Download log',
                    detail: message,
                    life: 3000,
                    closable: true
                })
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
        height: 80%;
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

    .dropdown-menu {
        --oruga-dropdown-menu-background: var(--black-background-900);
        --oruga-dropdown-item-active-background-color: var(--black-background-800);
        --oruga-dropdown-item-hover-background-color: var(--black-background-850);
        
        width: 100%;
    }

    .dropdown-item {
        color: var(--white-text);
        transition: all .2s ease;
        margin: .5em;
        border-radius: 8px;
    }
        .dropdown-item:hover {
            color: var(--white-text) !important;
            transition: all .2s ease;
        }

    .dropdown-button {
        width: 100%;
        border: 1px solid var(--black-background-800);
        transition: all ease .2s;
    }
        
        .dropdown-button:focus, .dropdown-button:hover {
            box-shadow: none;
            border-color: var(--black-background-700);
            transition: all ease .2s;
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