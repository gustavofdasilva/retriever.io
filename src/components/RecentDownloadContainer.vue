<template>
    <div class="recent-download-container">
        <div class="label">
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
        <RecentDownloadCard v-for="download in downloadLog"
                    :thumbnail-url="download.thumbnailUrl"
                    :title="download.title" 
                    :channel="download.channel" 
                    :quality="download.quality" 
                    :format="download.format" 
                    :length="download.length"/>


        <p v-if="downloadLog.length==0" style="text-align: center; margin-top: 2em;">No recent downloads found. Start retrieving!</p>
    </div>
</template>

<script lang="ts">
import RecentDownloadCard from './RecentDownloadCard.vue';

    export default {
        name: "RecentDownloadContainer",
        components: {
            RecentDownloadCard
        },
        props: {
            downloadLog: {
                type: Array,
                default: []
            }
        }
    }
</script>

<style scoped>

        .recent-download-container .label {
            
            display: grid;
            grid-template-columns: 1.2fr repeat(2, 2fr) repeat(4, 1fr);
            grid-template-rows: 1fr;
            grid-column-gap: 15px;
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
                font-weight: bold;
            }

    p {
        color: var(--black-background-600);
        font-size: 0.86em;
        margin-top: 0.3em;
    }
</style>