<template>
    <div class="recent-card-container recent-download-card-size">
        <div :style="{'background-image': 'url('+thumbnailUrl+')'}" class="thumbnail"></div>
        <div>
            <p style="font-weight: bold;">
                {{ title }}
            </p>
        </div>
        <div>
            <p>
                {{ channel }}
            </p>
        </div>
        <div>
            <p >
               {{ quality }}
            </p>
        </div>
        <div>
            <p>
                {{format}}
            </p>
        </div>
        <div>
            <p>
                {{ length }}
            </p>
        </div>
        <div >
            <Button severity="secondary" variant="text" type="button" icon="pi pi-ellipsis-v" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" />
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
        </div>
    </div>
</template>
<script>
import Button from 'primevue/button';
import BaseIconButton from './BaseIconButton.vue';
import Menu from 'primevue/menu';
import { ref } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { deleteRegister } from '../helpers/history';
import { useDownloadLogStore } from '../stores/downloadLog';


    export default {
        components: {
            BaseIconButton,
            Button,
            Menu
        },
        props: {
            thumbnailUrl: String,
            title: String,
            channel: String,
            quality: String,
            format: String,
            length: String,
            path: String,
            date: Date,
        },
        setup() {
            const deleteItem = (title, timestamp) => {deleteRegister(title,timestamp)};
            const downloadStore = useDownloadLogStore();

            return {
                deleteItem,
                downloadStore
            }
        },
        data() {
            return {
                items: [
                    {
                        label: 'Open in explorer',
                        icon: 'pi pi-folder-open',
                        command: () => {
                            invoke('show_in_folder',{
                                path: `${this.path}`,
                            })
                        }
                    },
                    // { 
                    //     label: 'Restart download',
                    //     icon: 'pi pi-replay',
                    //     command: () => {
                    //         console.log("Restart download")
                    //     }
                    // },
                    {
                        label: 'Delete file',
                        icon: 'pi pi-trash',
                        command: () => {
                            
                            const pathToFile = `${this.path}\\${this.title}`
                            invoke('delete_file',{
                                path: pathToFile,
                            }).then(async()=>{
                                await deleteRegister(this.title, this.date);
                                await this.downloadStore.loadDownloadHistory();
                                this.$toast.add({
                                    severity: 'secondary',
                                    summary: 'Delete file',
                                    detail: 'File deleted!',
                                    life: 3000,
                                    closable: true
                                })
                            })
                        },
                        class: 'alert'
                    }
                ]
            }
        },
        methods: {
            formatLength() {

            },
            toggle(event) {
                this.$refs.menu.toggle(event);
            }
        }
    }

</script>

<style scoped>
    .recent-card-container {
        justify-self: center;
        width: 100%;
        height: 4.5em;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        padding: 0.5em .8em;
        margin: 0.5em 0.5em;
    }
        .recent-card-container div {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: start;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            
        }

    .thumbnail {
        background-image: url(https://placehold.co/600x400);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        border-radius: 8px;
    }

    a:hover {
        color: unset;
    }

    p {
        font-size: 0.8em;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 150px;
        text-align: start;
    }
    
</style>