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
        <DownloadPendingCard v-for="download in loadingStore.getPendingDownloads"
                :downloadId="download.id"
            />
        <DownloadInProgressCard v-for="download in loadingStore.getActiveDownloads"
                :downloadId="download.id"
            />
        <RecentDownloadCard style="margin-left: 0;" v-for="download in filteredLogs"
                    :thumbnail-url="download.thumbnailUrl"
                    :title="download.title" 
                    :channel="download.channel" 
                    :quality="download.quality" 
                    :format="download.format" 
                    :length="String(download.length)"
                    :path="download.path"
                    :date="new Date(download.dateCreated)"/>

        <Paginator class="paginator" v-if="downloadLogStore.getDownloadLog.length!=0" :rows="10" :totalRecords="downloadLogStore.getDownloadLog.length" @page="filterLogs" ></Paginator>

        <p v-if="downloadLogStore.getDownloadLog.length==0" style="text-align: center; margin-top: 2em;">No recent downloads found. Start retrieving!</p>
    </div>
</template>

<script lang="ts">
import Paginator from 'primevue/paginator';
import RecentDownloadCard from './RecentDownloadCard.vue';
import { toRefs, watch } from 'vue';
import { useDownloadLogStore } from '../stores/downloadLog';
import { useLoadingStore } from '../stores/loading';
import DownloadInProgressCard from './DownloadInProgressCard.vue';
import DownloadPendingCard from './DownloadPendingCard.vue';

    export default {
        name: "RecentDownloadContainer",
        components: {
            RecentDownloadCard,
            Paginator,
            DownloadInProgressCard,
            DownloadPendingCard
        },
        data() {
            return {
                filteredLogs: [] as DownloadLog[],
                activeDownloads: [] as DownloadInProgress[],
                pendingDownloads: [] as DownloadInProgress[],
                first: 0,
            }
        },
        setup() {
            const downloadLogStore = useDownloadLogStore();
            const loadingStore = useLoadingStore();

            return {
                loadingStore,
                downloadLogStore,
            }
        },
        async mounted() {
            this.loadingStore.$subscribe((mutation, state)=> {
                this.activeDownloads = state.activeDownloads;
                this.pendingDownloads = state.pendingDownloads;
            })
            
            this.downloadLogStore.$subscribe((mutation, state) => {
                this.filteredLogs = state.downloadLog.slice(this.first,this.first+10>=state.downloadLog.length?state.downloadLog.length:this.first+10);
            })

            await this.downloadLogStore.loadDownloadHistory();
            this.filteredLogs = this.downloadLogStore.getDownloadLog.slice(0,10);
            this.activeDownloads = this.loadingStore.getActiveDownloads;
            this.activeDownloads = this.loadingStore.getPendingDownloads;
        },
        methods: {
            filterLogs(event:any) {
                this.first = event.first
                const start = event.first
                const end = event.first + event.rows;
                this.filteredLogs = this.downloadLogStore.getDownloadLog.slice(start,end);
            },
        }
    }
</script>

<style scoped>

        .recent-download-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }

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
    
    .paginator {
        position: fixed;
        bottom: 0;
        width: 50%;
        left: 50%;
        transform: translateX(-50%);
    }

    p {
        color: var(--black-background-600);
        font-size: 0.86em;
        margin-top: 0.3em;
    }
</style>