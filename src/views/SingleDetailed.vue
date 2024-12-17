<template>
    <div class="container">
        <main>
            <h1>Detailed</h1>
            <div style="width: 1em; height: 10em;"></div>
            <BaseSearchBar/>
            <p style="padding-top: 1em;"><a href="/">Detailed download</a> if you need more options</p>
            <p><a href="/">Multiple download</a> if you need many downloads</p>
            <div style="width: 100%;">
                <h2 class="sub-title" >Recent Downloads</h2>
                <RecentDownloadCard/>
                <RecentDownloadCard/>
                <RecentDownloadCard/>
                <RecentDownloadCard/>
                <RecentDownloadCard/>
                <RecentDownloadCard/>
            </div>
        </main>
    </div>
</template>
<script>
import BaseSearchBar from '../components/BaseSearchBar.vue';
import RecentDownloadCard from '../components/RecentDownloadCard.vue';
import TheHeader from '../components/TheHeader.vue';
    export default {
        components: {
            TheHeader,
            BaseSearchBar,
            RecentDownloadCard
        }   
    }
</script>
<style scoped>
    .sub-title{
        margin: 2em 0 0.6em 0;
        font-size: 1.5em;
        font-weight: bold ;
        align-self: flex-start;
    }

    .container {
        min-height: 100vh;
        background-color: var(--black-background-850);
        background-image: url(../assets/bg-simple-1.svg);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }

    main {
        min-height: 87.7%;
        margin: auto;
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    p {
        color: var(--black-background-600);
        font-size: 0.86em;
        margin-top: 0.3em;
    }
</style>