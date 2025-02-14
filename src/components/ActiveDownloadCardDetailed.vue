<template>
    <div class="active-card-container" :style="style">
        <div class="thumbnail" :style="{backgroundImage: 'url('+mediaStore.getThumbnail+')'}"></div>
        <div class="metadata">
            <div class="button-w-title-container">
                <h1 style="font-size: 1.5em;">{{mediaStore.getTitle}}</h1>
                <Button icon="pi pi-times" @click="()=>{exit()}" variant="text" size="large" severity="secondary" />
            </div>
            <p style="font-size: 1em; color:var(--black-background-600); margin: .2em 0 .6em 0;">{{mediaStore.getChannel}}</p>
            <div class="options-container media-info">
                <div>
                    <VueFeather type="eye" size="16" />
                    <p > {{ formatNumber(mediaStore.getViews??"NA") }}</p>
                </div>
                <div>
                    <VueFeather type="thumbs-up" size="16" />
                    <p > {{ formatNumber(mediaStore.getLikes??"NA") }} </p>
                </div>
                <div>
                    <VueFeather type="thumbs-down" size="16" />
                    <p >{{ formatNumber(mediaStore.getDislikes??"NA") }} </p>
                </div>
            </div>
            <h2>Output file</h2>
            <div class="options-container">

                <div class="options-subcontainer">
                    <FloatLabel style="width: 100%;" fluid variant="on">
                    <label style="z-index: 1;" for="file_ext_dropdown">File type</label>    
                    <!-- <Select fluid inputId="file_ext_dropdown" style="width: 100%;" v-model="fileExt" :options="fileExts" optionLabel="name"/> -->
                    <AutoComplete  fluid inputId="file_ext_dropdown" v-model="fileExt" dropdown :suggestions="filteredFileExts" @complete="searchFileExt" />
                    </FloatLabel>
                </div>

                <div class="options-subcontainer">
                    <FloatLabel variant="on">
                        <label style="z-index: 1;" for="resolution_dropdown">Resolution</label>
                        <AutoComplete fluid inputId="resolution_dropdown" v-model="resolution" dropdown :suggestions="filteredVideoQualities" @complete="searchResolution" />
                    </FloatLabel>
                </div>

                <div class="options-subcontainer">
                    <FloatLabel variant="on">
                        <label style="z-index: 1;" for="bitrate_dropdown">Bitrate</label>
                        <AutoComplete  fluid inputId="bitrate_dropdown" v-model="bitrate" dropdown :suggestions="filteredAudioQualities" @complete="searchBitrate" />
                    </FloatLabel>
                </div>
                
            </div>

            <h2>Output path</h2>
            <div style="width: 100%; padding: 0 1em;">

                <BaseFileInput
                    :key="outputPath"
                    :path="outputPath"
                    @folder-selected="setOutputPath"
                    style="width: 100%; justify-content: flex-start; font-size: .9em;"
                />
                <Message style="margin-left: 1em;" v-if="(missingInfo && outputPath == '')" severity="error" size="small" variant="simple">Select output path</Message>
            </div>

            <h2>File name</h2>
            <div class="fileName">
                <aside style="z-index: 100; margin-right: 1em;">{{ fileExt }}</aside>
                <AutoComplete class="suggestions-input" v-model="fileName" :showEmptyMessage="false" :suggestions="filteredVariables" @complete="search" 
                    :pt="{
                        root(root:any) {
                            root.instance.onOptionSelect = (event:any, option:any) => {
                                let optionArray = Array.from(option)
                                const varValue = variables.find((el:any)=>el.label==option)

                                for (let i = 0; i < optionArray.length; i++) {
                                    const fragmentedString = optionArray.slice(0,i+1).join('').toLowerCase()
                                    if(fileName.toLowerCase().endsWith(fragmentedString)) {
                                        fileName = fileName.slice(0,-(i+1))
                                        fileName += varValue?.value ?? option;
                                        return
                                    }
                                }

                                fileName+=varValue?.value??option;
                                
                            }
                        },
                    }"
                />
                <Message style="margin-left: 1em;" v-if="(missingInfo && fileName == '')" severity="error" size="small" variant="simple">Select file name</Message>
            </div>

            <!--Div Var connected to some input-->

            

            <div style="margin-top: 2em; width: 100%; ">
                <div style="display: flex; align-items: center; ">
                    <h2 style="margin-top:.7em;">Trim</h2> <!--Tool tip too-->
                    <ToggleSwitch style="margin-left: .8em;" v-tooltip="'Select video range'" v-model="trim" />
                </div>
                <template v-if="trim" >
                    <div style="width: 100%; padding: 0 1em;">
                        <div class="double-input" style="justify-content: center;">
                            <p style="margin-right: 1.2em; font-weight: 600;">Range:</p>
                            <p style="margin-right: .8em;">Start</p>
                            <div style="flex: 1;">
                                <input placeholder="Start" type="text" name="start" id="start" v-model="range.start">
                                <Message style="margin-left: 1em;" v-if="(missingInfo && range.start == '') || !/^(?:(\d{2}):)?(\d{2}):(\d{2})(?::(\d{2}))?$/g.test(range.start)" severity="error" size="small" variant="simple">Select a valid value (MM:SS)</Message>
                            </div>
                            <p style="margin-right: .8em; margin-left: 1em;">Finish</p>
                            <div style="flex: 1">
                                <input placeholder="Finish" type="text" name="finish" id="finish" v-model="range.finish">
                                <Message style="margin-left: 1em;" v-if="(missingInfo && range.finish == '') || !/^(?:(\d{2}):)?(\d{2}):(\d{2})(?::(\d{2}))?$/g.test(range.finish)" severity="error" size="small" variant="simple">Select a valid value (MM:SS)</Message>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <div class="thumbnail-container">
                <div style="display: flex; align-items: center; ">
                    <h2 style="margin-top:.7em;">Thumbnail</h2> <!--Tool tip too-->
                    <ToggleSwitch style="margin-left: .8em;" v-tooltip="'Download thumbnail?'" v-model="thumbnail.download" />
                </div>
                <template v-if="thumbnail.download" >
                    <div style="padding: 0 1em;">
                        <h2 style="margin-top: .5em;">File name</h2>
                        <div style="width: 100%; padding: 0 1em;">
                            <InputText v-model="thumbnail.fileName" type="text" name="thumbfilename" id="thumbfilename" style="width: 100%;"/>
                            <Message style="margin-left: 1em;" v-if="(missingInfo && thumbnail.fileName == '') " severity="error" size="small" variant="simple">Select file name</Message>
                        </div>
                    </div>
                </template>
            </div>

            <Button icon="pi pi-download" style="width: 100%;" label="Download" severity="primary" @click="()=>{if(!loading){download()}}" />
        </div>
    </div>
</template>
<script lang="ts">
import { invoke } from '@tauri-apps/api/core';
import { useMediaStore } from '../stores/media';
import { useFSStore } from '../stores/fileSystem';
import BaseFileInput from './BaseFileInput.vue';
import AutoComplete from 'primevue/autocomplete';
import ytdlpVariables from '../constants/ytdlpVariables';
import VueFeather from 'vue-feather'
import Toast from 'primevue/toast';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import { useLoadingStore } from '../stores/loading';
import ProgressBar from 'primevue/progressbar';
import Menu from 'primevue/menu';
import { audioQualities, videoQualities } from '../constants/qualities';
import { fileExtensions } from '../constants/fileExtensions';
import FloatLabel from 'primevue/floatlabel';
import { checkFormat, findConfigCode } from '../helpers/download';
import { useUserConfig } from '../stores/userConfig';
import { useDownloadLogStore } from '../stores/downloadLog';
import { findAccount } from '../helpers/accounts';
import { addToHist } from '../helpers/history';
import Message from 'primevue/message';


    export default {
        components: {
            BaseFileInput,
            AutoComplete,
            VueFeather,
            Select,
            InputText,
            ToggleSwitch,
            Button,
            ProgressBar,
            Toast,
            Menu,
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
                // format: '',
                // formats:[
                //     {label:"Audio (mp3)",value:"Audio"},
                //     {label:"Video (mp4)",value:"Video"},
                // ],
                audioQualities: audioQualities,
                filteredAudioQualities: [] as string[],
                videoQualities: videoQualities,
                filteredVideoQualities: [] as string[],
                fileExts: fileExtensions,
                filteredFileExts: [] as string[],
                range: {
                    start: '00:00',
                    finish: '0',
                },
                resolution: '',
                bitrate: '',
                fileExt:'',
                fileName:'',
                variables: ytdlpVariables,
                filteredVariables: [] as string[],
                outputPath: '',
                thumbnail: {
                    download: false,
                    fileName: 'thumbnail',
                },
                trim: false,
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
        mounted() {
            this.outputPath = this.userConfig.getUserConfig.defaultOutput;
            this.fileName = this.mediaStore.title;
            this.fileExt = this.userConfig.getUserConfig.defaultVideoFormat;
            this.range.finish = this.mediaStore.getDuration;
        },
        methods: {
            checkInputsCompleted():boolean {
                if(this.outputPath == '' || 
                this.fileName == '' || 
                (this.trim && (this.range.start == '' || this.range.finish == '')) ||
                (this.thumbnail.download && this.thumbnail.fileName == '')
                ) {
                    return false
                }
                return true
            },
            searchResolution(event: any) {
                this.filteredVideoQualities = event.query ? this.videoQualities.filter((resolution) => {
                    return resolution.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): this.videoQualities.map((item)=>item.name);
            },
            searchBitrate(event: any) {
                this.filteredAudioQualities = event.query ? this.audioQualities.filter((bitrate) => {
                    return bitrate.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): this.audioQualities.map((item)=>item.name);
            },
            searchFileExt(event: any) {
                this.filteredFileExts = event.query ? this.fileExts.filter((exts) => {
                    return exts.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): this.fileExts.map((item)=>item.name);
            },
            timeDifference(start:string, end:string) {
                function timeInSeconds(time:string) {
                    const [hours, minutes, seconds] = time.split(':').map(Number);
                    return hours * 3600 + minutes * 60 + seconds;
                }

                const startTime = timeInSeconds(start);
                const endTime = timeInSeconds(end);

                let difference = Math.abs(endTime - startTime);

                const hours = Math.floor(difference / 3600);
                difference %= 3600;
                const minutes = Math.floor(difference / 60);
                const seconds = difference % 60;

                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            },
            formatNumber(num: number | string) {
                if(typeof num == 'string') {
                    return num
                }

                if (num >= 1000000000) {
                    return (num / 1000000000).toFixed(1) + 'b';  // Para números acima de 1 bilhão
                } else if (num >= 1000000) {
                    return (num / 1000000).toFixed(1) + 'm';    // Para números acima de 1 milhão
                } else if (num >= 1000) {
                    return (num / 1000).toFixed(1) + 'k';      // Para números acima de 1 mil
                } else {
                    return num.toString();                     // Para números abaixo de 1 mil
                }
            },
            search(event: any) {
                setTimeout(() => {
                    const querySplit = event.query.split(/[-._ ]/g)
                    const queryValue = querySplit[querySplit.length-1]
                    if (!event.query.trim().length) {
                        this.filteredVariables = [];
                    } else {
                        this.filteredVariables = this.variables.filter((variable) => {
                            return variable.label.toLowerCase().startsWith(queryValue.toLowerCase()) || variable.value == queryValue;
                        }).map(val=>val.label);
                    }
                }, 250);
            },
            setOutputPath(path:string) {
                this.outputPath = path;
            },
            download() {
                if(!this.checkInputsCompleted()) {
                    this.missingInfo = true
                    this.newNotification('Alert','Missing video information',3000)
                    return
                }
                
                this.missingInfo = false
                const fileExtCode = this.fileExt ? findConfigCode(this.fileExt, fileExtensions) : 'any'
                
                let fileType = checkFormat(fileExtCode);

                const fileExt = fileExtCode.includes('any') ? 'any' : fileExtCode
                const outputPath = this.outputPath == '' ? this.userConfig.getUserConfig.defaultOutput : this.outputPath 
                const output = `${outputPath}/${this.fileName == '' ? this.userConfig.getUserConfig.defaultFileName : this.fileName}`
                const thumbnailPath = this.thumbnail.download ? `${outputPath}/${this.thumbnail.fileName}` : ""

                const enabledAuth = this.userConfig.getUserConfig.authentication.enabled;
                const cookiesFromBrowser = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesFromBrowser: "";
                const cookiesTxtFilePath = enabledAuth ? this.userConfig.getUserConfig.authentication.cookiesTxtFilePath: "";
                const username = enabledAuth ? findAccount(this.mediaStore.getUrl)?.username : '';
                const password = enabledAuth ? findAccount(this.mediaStore.getUrl)?.password : '';
  
                console.log(this.range)
                this.loadingStore.addActiveDownload({
                    id: '', // id will be overwritten by a autoincremented id when pushing to active downloads array 
                    thumbnailUrl: this.mediaStore.getThumbnail,
                    title: this.mediaStore.getTitle,
                    channel: this.mediaStore.getChannel,
                    format: fileType as "Video" | "Audio",
                    quality: `${this.resolution}/${this.bitrate}`,
                    length: this.mediaStore.getDuration,
                    path: outputPath,
                    dateCreated: new Date(),
                    cancelled: false,
                    info: '',
                progress: '',
                    loading: false,
                    url: this.mediaStore.getUrl, 
                    output: output, 
                    fileExt: fileExt,
                    resolution: this.resolution ? findConfigCode(this.resolution, videoQualities) : 'any',
                    bitrate: this.bitrate ? findConfigCode(this.bitrate, audioQualities) : 'any',
                    startSection: this.trim ? this.range.start : '',
                    endSection: this.trim ? this.range.finish : '',
                    thumbnailPath: thumbnailPath,
                    username: username ?? "",
                    password: password ?? "",
                    cookiesFromBrowser: cookiesFromBrowser,
                    cookiesTxtFilePath: cookiesTxtFilePath,
                })
                this.$router.push('/downloads');
                this.newNotification('Download Log','URL added to queue',3000);
            },
            getProgressInfo(id: string) {
                const download = this.loadingStore.getActiveDownloadById(id)
                if(!download) return

                this.downloadProgressToast(id);
                const loadProgress = setInterval(()=>{
                    if (download.loading) {
                        invoke('get_progress_info',{downloadId: id}).then((res:any)=>{
                            if(res == "") return

                            this.loadingStore.setActiveDownloadById(
                                id,
                                ['info'],
                                [res])
                            ;
                            try {
                                let progressValue = res.match(/(\d+\.\d+)%/g)[0].replace("%",'')
                                this.loadingStore.setActiveDownloadById(
                                    id,
                                    ['progress'],
                                    [progressValue])
                                ;
                            } catch (error) {}
                        })
                    } else {
                        clearInterval(loadProgress);
                    }
                },1000)
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
            downloadProgressToast(id: string) {
                this.$toast.add({ 
                    severity: 'secondary', 
                    summary: id, 
                    group: 'downloadProgress'});
            },
            newNotification(summary: string, message: string,life:number) {
                this.$toast.add({
                    severity: 'secondary',
                    summary: summary,
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

<style scoped>
        
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }

    input[type=number] {
    -moz-appearance: textfield;
    }

    .active-card-container {
        width: 100%;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
        border-radius: var(--p-form-field-border-radius);
        padding: 1.5em 1em;
        margin: 0.5em 0.5em;
        position: relative;
    }

    .thumbnail {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        height: 20vh;
        width: 100%;
        margin-bottom: 1.5em;
        border-radius: var(--p-form-field-border-radius);
    }
    
    .metadata {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        height: 80%;
    }

    h2 {
        font-weight: 600;
        font-size: 1.2em;
        margin-bottom: .5em;
        margin-top: 2.5em;
    }

    p {
        font-size: 0.92em;
    }

    input {
        background: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        padding: .4em .9em;
        outline: none;
        transition: all ease .2s;
    }
        
        input:focus, input:hover {
            border-color: var(--black-background-700);
            transition: all ease .2s;
        }

    .options-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: .5em 0;
        padding: 0 1em;
    }

    .media-info {
        border: 1px solid var(--black-background-800); 
        border-radius: var(--p-form-field-border-radius);
        padding: .5em 1em;
        margin: .7em 0 0 0;
        display: flex;
        align-items: center;
    }
        .media-info p {
            font-size: 1em;
            margin-left: .5em;
        }

        .media-info div {
            display: flex;
            align-items: center;
        }

    .double-input {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .double-input input {
        width: 100%;
        text-align: center;
    }

    .fileName {
        width: 100%; 
        padding: 0 1em; 
        height: 100%;
        position: relative;
    }
        .fileName aside {
            position: absolute; 
            top: 50%; 
            transform: translate(0,-50%); 
            right: 40px; 
            color: var(--white-text);
        }


    .options-container .options-subcontainer:not(:last-child) {
        margin-right: 1.5em;
        width: 100%;
    }

    .options-subcontainer {
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        flex: 1;
    }

        .options-subcontainer p {
            white-space: nowrap;
            margin-right: 1em;
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

    .thumbnail-container {
        margin: 2em 0;
        width: 100%;
    }
    
</style>