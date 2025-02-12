<template>
    <div class="card-container" :style="{'opacity':  0.6 }" > <!-- -->
        <div class="card-sub-container recent-download-card-size">
            <div :style="{'background-image': 'url('+loadingStore.getPendingDownloadById(downloadId)?.thumbnailUrl+')'}" class="thumbnail"></div>
            <div>
                <p style="font-weight: bold;">
                    {{ loadingStore.getPendingDownloadById(downloadId)?.title }}
                </p>
            </div>
            <div>
                <p>
                    {{ loadingStore.getPendingDownloadById(downloadId)?.channel }}
                </p>
            </div>
            <div>
                <p >
                   {{ loadingStore.getPendingDownloadById(downloadId)?.quality }}
                </p>
            </div>
            <div>
                <p>
                    {{loadingStore.getPendingDownloadById(downloadId)?.format}}
                </p>
            </div>
            <div>
                <p>
                    {{ formatLength(loadingStore.getPendingDownloadById(downloadId)?.length??"") }}
                </p>
            </div>
            <div >
                <Button severity="secondary" variant="text" type="button" icon="pi pi-ellipsis-v" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </div>
        </div>
        <div class="progress-info-container" >
            <ProgressBar style="height: 10px;" :mode="(loadingStore.getPendingDownloadById(downloadId)??{} as DownloadInProgress).progress == '' ? 'indeterminate' : 'determinate'" :value="Number((loadingStore.getPendingDownloadById(downloadId)??{} as DownloadInProgress).progress)" />
            <p>Pending...</p>
        </div>
    </div>
</template>
<script lang="ts" >
import Button from 'primevue/button';
import BaseIconButton from './BaseIconButton.vue';
import Menu from 'primevue/menu';
import { deleteRegister } from '../helpers/history';
import { useDownloadLogStore } from '../stores/downloadLog';
import { useLoadingStore } from '../stores/loading';
import ProgressBar from 'primevue/progressbar';


    export default {
        components: {
            BaseIconButton,
            Button,
            Menu,
            ProgressBar
        },
        props: {
            downloadId: {
                type: String,
                default: ''
            },
        },
        setup() {
            const deleteItem = (title: string, timestamp:Date) => {deleteRegister(title,timestamp)};
            const downloadStore = useDownloadLogStore();
            const loadingStore = useLoadingStore();

            return {
                deleteItem,
                downloadStore,
                loadingStore
            }
        },
        data() {
            return {
                activeDownload: {} as DownloadInProgress,
                formattedLength: "",
                items: [
                    {
                        label: 'Cancel download',
                        icon: 'pi pi-close',
                        command: () => {
                            this.cancelDownloadPending(this.downloadId);
                            this.closeDownloadProgressToast(this.downloadId);
                        },
                        class: 'alert'
                    }
                ]
            }
        },
        methods: {
            closeDownloadProgressToast(id: string) {
                //Needs refactor
                const toast = document.getElementById(`DOWNLOAD_TOAST_${id}`) //! Workaround to remove only the toast related to the download
                if(!toast) return
                if(!toast.parentElement) return

                toast.parentElement.remove();
            },
            cancelDownloadPending(activeDownloadId: string) {
                this.loadingStore.removePendingDownloadById(activeDownloadId);
            },
            formatLength(length: string) {
                if(length == "" || length == "NA" || !length){
                    return "NA"
                }            


                switch (length.length) {
                    case 1: return `00:0${length}`

                    case 2: return `00:${length}`

                    case 4: return `0${length}`
                
                    default: return length
                }
            },
            toggle(event: any) {
                //@ts-ignore
                this.$refs.menu.toggle(event);
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
        }
    }

</script>

<style scoped>
    .card-container {
        background: #000;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.5em .8em;
        margin: .5em 0;
    }

    .card-sub-container {
        justify-self: center;
        width: 100%;
        flex: 1;
    }
        .card-sub-container div {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: start;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            
        }

    .progress-info-container {
        width: 100%;
        margin-top: .8em;
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