<template>
    <div class="recent-download-container">
        <div class="label recent-download-card-size">
        <div class="thumbnail">
            <p>
                Thumbnail
            </p>
        </div>
        <div>
            <p>
                Title
            </p>
        </div>
        <div>
            <p>
                Channel
            </p>
        </div>
        <div>
            <p >
                Quality
            </p>
        </div>
        <div>
            <p>
                Format
            </p>
        </div>
        <div>
            <p>
                Length
            </p>
        </div>
        <div >
            <p>Actions</p>
        </div>
        </div>
        <DownloadInProgressCard v-for="download in activeDownloads"
                :downloadId="download.id"
            />
        <RecentDownloadCard v-for="download in filteredLogs"
                    :thumbnail-url="download.thumbnailUrl"
                    :title="download.title" 
                    :channel="download.channel" 
                    :quality="download.quality" 
                    :format="download.format" 
                    :length="String(download.length)"
                    :path="download.path"
                    :date="new Date(download.dateCreated)"/>

        <Paginator style="margin-bottom: 1em;" v-if="downloadLogStore.getDownloadLog.length!=0" :rows="10" :totalRecords="downloadLogStore.getDownloadLog.length" @page="filterLogs" ></Paginator>

        <p v-if="downloadLogStore.getDownloadLog.length==0" style="text-align: center; margin-top: 2em;">No recent downloads found. Start retrieving!</p>
    </div>
</template>

<script lang="ts" >
import Paginator from 'primevue/paginator';
import RecentDownloadCard from './RecentDownloadCard.vue';
import { useDownloadLogStore } from '../stores/downloadLog';
import DownloadInProgressCard from './DownloadInProgressCard.vue';
import { useLoadingStore } from '../stores/loading';

    export default {
        name: "RecentDownloadContainer",
        components: {
            RecentDownloadCard,
            DownloadInProgressCard,
            Paginator
        },
        data() {
            return {
                filteredLogs: [] as DownloadLog[],
                activeDownloads: [] as DownloadInProgress[],
                first: 0,
            }
        },
        setup() {
            const downloadLogStore = useDownloadLogStore();
            const loadingStore = useLoadingStore();

            return {
                downloadLogStore,
                loadingStore
            }
        },
        async mounted() {
            this.loadingStore.$subscribe((mutation, state)=> {
                this.activeDownloads = state.activeDownloads;
            })
            
            this.downloadLogStore.$subscribe((mutation, state) => {
                this.filteredLogs = state.downloadLog.slice(this.first,this.first+10>=state.downloadLog.length?state.downloadLog.length:this.first+10);
            })

            await this.downloadLogStore.loadDownloadHistory();
            this.filteredLogs = this.downloadLogStore.getDownloadLog.slice(0,10);
            this.activeDownloads = this.loadingStore.getActiveDownloads;
        },
        methods: {
            filterLogs(event:any) {
                console.log(event)
                this.first = event.first
                const start = event.first
                const end = event.first + event.rows;
                this.filteredLogs = this.downloadLogStore.getDownloadLog.slice(start,end);
            },
        }
    }
</script>

<style scoped>

        .recent-download-container .label {

            padding: 0.8em;
            margin-bottom: 1em;
            border-bottom: 1px solid var(--black-background-600);
        }
            .recent-download-container .label div {
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: start;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
            }
            
            .recent-download-container .label div p {
                color: var(--black-background-600);
            }

    p {
        color: var(--black-background-600);
        font-size: 0.86em;
        margin-top: 0.3em;
    }
</style>