<template>
    <div class="active-card-container">
        <div class="thumbnail" :style="{backgroundImage: 'url('+mediaStore.getThumbnail+')'}"></div>
        <div class="metadata">
            <h1 style="font-size: 1.5em;">{{mediaStore.getTitle}}</h1>
            <p style="font-size: 1em; color:var(--black-background-600); margin: 1em 0 1em 0;">{{mediaStore.getChannel}}</p>
            <div class="options-container">
                <div class="options-subcontainer" style="margin-right: 2em;">
                    <p style="margin-right: .5em;" >Quality</p>
                    <o-dropdown class="dropdown-menu">
                        <template #trigger="{ active }">
                            <o-button
                                class="base-container dropdown-button"
                                variant="primary"
                                :label="quality == '' ? 'Quality':quality"
                                :icon-right="active ? 'chevron-up' : 'chevron-down'" />
                        </template>

                        <o-dropdown-item class="dropdown-item" label="240p"  @click="()=>quality='240p'" />
                        <o-dropdown-item class="dropdown-item" label="360p"  @click="()=>quality='360p'" />
                        <o-dropdown-item class="dropdown-item" label="480p"  @click="()=>quality='480p'" />
                        <o-dropdown-item class="dropdown-item" label="720p"  @click="()=>quality='720p'" />
                        <o-dropdown-item class="dropdown-item" label="1080p"  @click="()=>quality='1080p'" />
                    </o-dropdown>
                </div>
                <div class="options-subcontainer" >
                    <p style="margin-right: .5em;" >Format</p>
                    <o-dropdown class="dropdown-menu">
                        <template #trigger="{ active }">
                            <o-button
                                class="base-container dropdown-button"
                                variant="primary"
                                :label="format == '' ? 'Format':format"
                                :icon-right="active ? 'caret-up' : 'caret-down'" />
                        </template>
    
                        <o-dropdown-item class="dropdown-item" label="Audio" @click="()=>format='Audio'" />
                        <o-dropdown-item class="dropdown-item" label="Video" @click="()=>format='Video'"  />
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


    export default {
        components: {
            BaseIconButton,
            BaseButton
        },
        data() {
            return {
                loading: false,
                format: '',
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
                const output = `${this.fsStore.getDefaultOutput}/${this.mediaStore.getTitle}`
                invoke('download',{url: this.mediaStore.getUrl, output: output}).then(()=>{
                    this.$emit('download-successful',true)
                }).catch(()=>{
                    this.$emit('download-successful',false)
                }).finally(()=>{
                    this.loading = false
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
    }

    .thumbnail {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        height: 10em;
        width: 15em;
        border-radius: 8px;
    }
    
    .metadata {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        width: 70%;
        height: 80%;
        padding-left: 1em;
    }

    p {
        font-size: 0.92em;
    }

    .options-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .options-subcontainer {
        flex: 1;
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
    
</style>