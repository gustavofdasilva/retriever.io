<template>
    <div class="recent-card-container">
        <div :style="{'background-image': 'url('+thumbnailUrl+')'}" class="thumbnail"></div>
        <p style="font-weight: bold;">
            {{ title }}
        </p>
        <p>
            {{ channel }}
        </p>
        <p>
            <span style="color: var(--black-background-600);">Quality</span> {{ quality }}
        </p>
        <p>
            <span style="color: var(--black-background-600);">Format</span> {{format}}
        </p>
        <p>
            {{ length }}
        </p>
        <BaseIconButton btnIcon="menu" />
    </div>
</template>
<script lang="ts">
import BaseIconButton from './BaseIconButton.vue';


    export default {
        components: {
            BaseIconButton
        },
        props: {
            thumbnailUrl: String,
            title: String,
            channel: String,
            quality: String,
            format: String,
            length: Number,
        },
        methods: {
            formatLength() {

            }
        }
    }

</script>

<style scoped>
    .recent-card-container {
        justify-self: center;
        width: 100%;
        height: 3.5em;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        border-radius: 8px;
        padding: 0.5em 1em;
        margin: 0.5em 0.5em;
    }

    .thumbnail {
        background-image: url(https://placehold.co/600x400);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        height: 85%;
        width: 5em;
        border-radius: 8px;
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