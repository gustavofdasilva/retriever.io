<template>
    <div class="active-card-container" :style="style">
        
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
                    <o-dropdown v-model="format" class="dropdown-menu" >
                        <template #trigger="{ active }">
                            <o-button
                                class="base-container dropdown-button"
                                variant="primary"
                                :label="format == '' ? 'Format':format"
                                :icon-right="active ? 'chevron-up':'chevron-down'"/>
                        </template>

                        <o-dropdown-item 
                            v-for="f in formats"
                            :class="'dropdown-item'" 
                            :label="f.label"  
                            :value="f.value"
                            @click="()=>{
                                
                                if(f.value=='Audio') {
                                    if(qualities != audioQualities) quality=''
                                    qualities = audioQualities
                                } else {
                                    if(qualities != videoQualities) quality=''
                                    qualities = videoQualities
                                }
                            }"/>
    
                    </o-dropdown>
                </div>

                <div class="options-subcontainer">
                    <p style="margin-right: 1em;" >Quality</p>
                    <o-dropdown v-model="quality" class="dropdown-menu" :disabled="format==''" >
                        <template #trigger="{ active }">
                            <o-button
                                class="base-container dropdown-button"
                                variant="primary"
                                :label="quality == '' ? 'Quality':quality"
                                :icon-right="active ? 'chevron-up':'chevron-down'"/>
                        </template>

                        <o-dropdown-item 
                            v-for="q in qualities"
                            :key="q"
                            class="dropdown-item" 
                            :label="q.label" 
                            :value="q.value"/>
                    </o-dropdown>
                </div>
                
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

const oruga = useOruga();

    export default {
        components: {
            BaseIconButton,
            BaseButton
        },
        props: {
            style: Object
        },
        data() {
            return {
                loading: false,
                format: '',
                formats:[
                    {label:"Audio (mp3)",value:"Audio"},
                    {label:"Video (mp4)",value:"Video"},
                ],
                videoQualities: [
                    {label:'144p',value:"144p"},
                    {label:'240p',value:"240p"},
                    {label:'360p',value:"360p"},
                    {label:'720p',value:"720p"},
                    {label:'1080p',value:"1080p"},
                ],
                audioQualities: [
                    {label:'128kbps',value:"128kbps"},
                    {label:'320kbps',value:"320kbps"},
                ],
                qualities:[],
                quality: '',
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
        methods: {
            download() {
                this.loading=true
                const fileType = this.format == "Audio" ? 'mp3' : 'mp4';
                const output = `${this.fsStore.getDefaultOutput}/${this.mediaStore.getTitle}`
                invoke('download',{
                    url: this.mediaStore.getUrl, 
                    output: output, 
                    format: this.format, 
                    fileExt: fileType,
                    quality: this.quality,
                    startSection: "00:00",
                    endSection: this.mediaStore.getDuration
                }).then(()=>{
                    this.mediaStore.setFormat(this.format)
                    this.mediaStore.setQuality(this.quality);
                    
                    this.newNotification("Download successful!");
                    this.$emit('download-successful',true)
                }).catch(()=>{
                    this.newNotification("Something went wrong :(");
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
    .active-card-container {
        width: 100%;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        border-radius: 8px;
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

    
</style>