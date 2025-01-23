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
                    <div >
                        <FloatLabel variant="on">
                            <label style="z-index: 1;" for="quality_dropdown">Quality</label>
                            <AutoComplete :key="format" fluid inputId="quality_dropdown" v-model="quality" dropdown :suggestions="qualities" @complete="search" />
                        </FloatLabel>
                        <!-- <Select v-model="quality" :options="qualities" optionLabel="name" placeholder="Quality" class="w-full md:w-56" :disabled="format==''" /> -->
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
import { useUserConfig } from '../stores/userConfig';
import AutoComplete from 'primevue/autocomplete';
import FloatLabel from 'primevue/floatlabel';

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
                format: '',
                formats:formats,
                videoQualities: videoQualities,
                audioQualities: audioQualities,
                filteredQualities:[],
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
            const userConfig = useUserConfig();

            return { 
                mediaStore,
                fsStore,
                loadingStore,
                userConfig
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
            download() {
                this.loading=true
                const defaultFileName = this.userConfig.getDefaultFileName;
                console.log(defaultFileName);
                const fileType = this.format.code == "Audio" ? 'mp3' : 'mp4';
                const output = `${this.fsStore.getDefaultOutput}/${defaultFileName}`
                
                this.getProgressInfo();
                invoke('download',{
                    url: this.mediaStore.getUrl, 
                    output: output, 
                    format: this.format.code, 
                    fileExt: fileType,
                    quality: this.quality.replace(/\D/g,''),
                    startSection: "",
                    endSection: "",
                    goalFileSize: "100",
                    thumbnailPath: "",
                }).then((response)=>{
                    const outputFullPath = response.output.split('\\')
                    const outputName = outputFullPath[outputFullPath.length-1].replace(/\.(\w+)$/g,'');
                    const qualityOutput = `${this.quality.replace(/\D/g,'')}${this.format.code == "Audio" ? `kbps` : `p`}` 

                    this.mediaStore.setFormat(this.format.code)
                    this.mediaStore.setQuality(qualityOutput);
                    this.mediaStore.setTitle(outputName);
                    
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