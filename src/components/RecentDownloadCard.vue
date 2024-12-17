<template>
    <div class="recent-card-container">
        <div class="thumbnail"></div>
        <p style="font-weight: bold;">
            Video Title
        </p>
        <p>
            Channel
        </p>
        <p>
            <span style="color: var(--black-background-600);">Quality</span> 1080p
        </p>
        <p>
            <span style="color: var(--black-background-600);">Format</span> Video
        </p>
        <p>
            20:20
        </p>
        <BaseIconButton btnIcon="menu" />
    </div>
</template>
<script>
import BaseIconButton from './BaseIconButton.vue';


    export default {
        components: {
            BaseIconButton
        }
    }

</script>

<style scoped>
    .recent-card-container {
        max-width: 100%;
        min-width: 90%;
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
        font-size: 0.92em;
    }
    
</style>