<template>
    <div class="active-card-container" :style="style">
        
        <div class="thumbnail" :style="{backgroundImage: 'url('+mediaStore.getThumbnail+')'}"></div>
        <div class="metadata">
            <div class="button-w-title-container">
                <h1 style="font-size: 1.5em;">{{mediaStore.getTitle}}</h1>
                <BaseIconButton :onClickFunc="()=>{exit()}" btnIcon="x" />
            </div>
            <p style="font-size: 1em; color:var(--black-background-600); margin: .2em 0 .6em 0;">{{mediaStore.getChannel}}</p>
            <div class="options-container media-info">
                <p ><span>Views:</span> {{ mediaStore.getViews }}</p>
                <p ><span>Likes:</span> {{ mediaStore.getLikes }} </p>
                <p ><span>Dislikes:</span> {{ mediaStore.getDislikes }} </p>
            </div>
            <h2>Output file</h2>
            <div class="options-container">
                <div class="options-subcontainer">
                    <p>Quality</p>
                    <o-dropdown v-model="quality" class="dropdown-menu" >
                        <template #trigger="{ active }">
                            <o-button
                                class="base-container dropdown-button"
                                variant="primary"
                                :label="quality == '' ? 'Quality':quality"
                                :icon-right="active ? 'chevron-up':'chevron-down'"/>
                        </template>

                        <o-dropdown-item 
                            v-for="q in qualities"
                            :class="'dropdown-item'" 
                            :label="q.label"  
                            :value="q.value"/>
    
                    </o-dropdown>
                </div>

                <div class="options-subcontainer">
                    <p >File type</p>
                    <o-dropdown v-model="fileExt" class="dropdown-menu">
                        <template #trigger="{ active }">
                            <o-button
                                class="base-container dropdown-button"
                                variant="primary"
                                :label="fileExt == '' ? 'File type':fileExt"
                                :icon-right="active ? 'chevron-up':'chevron-down'"/>
                        </template>

                        <o-dropdown-item 
                            v-for="ft in fileExts"
                            :key="ft"
                            class="dropdown-item" 
                            :label="ft.label" 
                            :value="ft.value"/>
                    </o-dropdown>
                </div>

                <div class="options-subcontainer">
                    <p>Max size</p>
                    <div class="fileName" style="padding: 0;">
                        <aside style="right: 10%;">mb</aside>
                        <input v-model="maxSize" style="width: 100%;" type="number" name="maxSize" id="maxSize" >
                    </div>
                </div>
                
            </div>
            <div class="options-container">
                <div class="options-subcontainer">
                    <div class="double-input">
                        <p>Range</p>
                        <input placeholder="Start" type="text" name="start" id="start" v-model="range.start">
                        <input placeholder="Finish" type="text" name="finish" id="finish" v-model="range.end">
                    </div>
                </div>
            </div>

            <h2>Output path</h2>
            <div style="width: 100%; padding: 0 1em;">

                <BaseFileInput
                    style="width: 100%; justify-content: flex-start; font-size: .9em;"
                />
            </div>

            <h2>File name</h2>
            <div class="fileName">
                <aside >.{{ fileExt }}</aside>
                <input v-model="fileName" type="text" name="filename" id="filename" style="width: 100%;">
            </div>
            <div style="width: 100%; padding: 0 1em;">
                <BaseVariableNameHelper/>
            </div>

            <!--Div Var connected to some input-->

            <div class="thumbnail-container">
                <div style="display: flex; align-items: center; ">
                    <h2 style="margin-top:.7em;">Thumbnail</h2> <!--Tool tip too-->
                    <o-tooltip label="Download thumbnail image?" position="right" :delay="100">
                    <o-field style="margin: .6em 0 0 1em">
                        
                            <o-switch
                                size="small"
                                v-model="thumbnail.download">
                            </o-switch>
                    </o-field>
                    </o-tooltip>
                </div>
                <template v-if="thumbnail.download" >
                    <h2 style="margin-top: .5em;">File name</h2>
                    <div style="width: 100%; padding: 0 1em;">
                        <input v-model="thumbnail.fileName" type="text" name="thumbfilename" id="thumbfilename" style="width: 100%;">
                        <BaseVariableNameHelper/>
                    </div>
                </template>
            </div>

            <BaseButton :btnClass="loading ? 'disable' : 'red'" text="Download" style="width: 100%; margin-top: 1em;" :onClickFunc="()=>{if(!loading){download()}}" />
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
import BaseFileInput from './BaseFileInput.vue';
import BaseVariableNameHelper from './BaseVariableNameHelper.vue';

const oruga = useOruga();

    export default {
        components: {
            BaseIconButton,
            BaseButton,
            BaseFileInput,
            BaseVariableNameHelper
        },
        props: {
            style: Object
        },
        data() {
            return {
                loading: false,
                // format: '',
                // formats:[
                //     {label:"Audio (mp3)",value:"Audio"},
                //     {label:"Video (mp4)",value:"Video"},
                // ],
                qualities: [
                    {label:'144p',value:"144p"},
                    {label:'240p',value:"240p"},
                    {label:'360p',value:"360p"},
                    {label:'720p',value:"720p"},
                    {label:'1080p',value:"1080p"},
                ],
                fileExts: [
                    {label:'.mp4',value:"mp4"},
                    {label:'.m4a',value:"m4a"},
                    {label:'.mp3',value:"mp3"},
                    {label:'.wav',value:"wav"},
                ],
                range: {
                    start: '00:00',
                    finish: '0',
                },
                quality: '1080p',
                fileExt:'mp4',
                maxSize: 10,
                fileName:'Video',
                thumbnail: {
                    download: false,
                    fileName: 'thumbnail',
                },

            }
        },
        setup() {
            const mediaStore = useMediaStore()
            const fsStore = useFSStore()

            return { 
                mediaStore,
                fsStore
            }
        },
        mounted() {
            this.range.end = this.mediaStore.getDuration
        },
        methods: {
            download() {
                this.loading=true
                
                let fileType;

                if (this.fileExt == "mp4" || this.fileExt == "m4a") {
                    fileType = "Video"
                } else {
                    fileType = "Audio"
                }

                const fileExt = this.fileExt
                const output = `${this.fsStore.getDefaultOutput}/${this.mediaStore.getTitle}`
                invoke('download',{
                    url: this.mediaStore.getUrl, 
                    output: output, 
                    format: fileType, 
                    fileExt: fileExt,
                    quality: this.quality,
                    startSection: this.range.start,
                    endSection: this.range.end,}).then(()=>{
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
                })
            },
            exit() {
                this.mediaStore.reset();
            },
            newNotification(message) {
                oruga.notification.open({
                    duration: 3000,
                    closable: true,
                    message: message,
                    rootClass: "toast toast-notification",
                    position: "bottom-right",
            })
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
        border-radius: 8px;
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
        border-radius: 8px;
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
        border-radius: 8px;
        padding: .4em .9em;
        outline: none;
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
        border-radius: 8px; 
        padding: .5em 1em;
        margin: .7em 0 0 0;
    }
        .media-info p {
            font-size: 1em;
        }

    .double-input {
        display: flex;
        align-items: center;
    }

    .double-input input {
        max-width: 4.5em;
        text-align: center;
        margin-right: 1em;
    }

    .fileName {
        width: 100%; 
        padding: 0 1em; 
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
    }

    .options-subcontainer {
        width: 100%;
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
    }

        .options-subcontainer p {
            white-space: nowrap;
            margin-right: 1em;
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
    }
        
    .dropdown-button:focus {
        box-shadow: none;
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
        margin-top: 2em;
        width: 100%;
    }
    
</style>