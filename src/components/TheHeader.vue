<template>
    <nav>
        <div class="options">
            <img src="../assets/vue.svg" alt="logo"/>
            <div style="margin-left: 2em;">
                <BaseButton text="Simple" :btnClass="(checkView('/') ? 'red' : '') + ' header-button'" :onClickFunc="()=>{changeView('/')}"/>
                <BaseButton text="Detailed" :btnClass="(checkView('/singleDetailed') ? 'red' : '') + ' header-button'"  :onClickFunc="()=>{changeView('/singleDetailed')}"/>
                <BaseButton text="Multiple" :btnClass="(checkView('/multiple') ? 'red' : '') + ' header-button'"  :onClickFunc="()=>{changeView('/multiple')}"/>
            </div>
        </div>
        <div class="path-and-settings">
            <BaseFileInput 
                style="margin: 0 1em 0 0; font-size: 0.93em;"
                @folder-selected="setDefaultFolder"/>
            <BaseIconButton btnIcon="settings" btnWidth="20" btnHeight="20" />
        </div>
    </nav>
</template>
<script lang="ts">
import { useFSStore } from '../stores/fileSystem';
import BaseButton from './BaseButton.vue';
import BaseFileInput from './BaseFileInput.vue';
import BaseIconButton from './BaseIconButton.vue';

    export default {
        name: "TheHeader",
        components: {
            BaseButton,
            BaseFileInput,
            BaseIconButton
        },
        data() {
            return {
                activeView: 'home',
                message: ''
            }
        },
        setup() {
            const fsStore = useFSStore()

            return {
                fsStore
            }
        },
        methods: {
            checkView(view: string) {
                console.log(this.$route.path);
                return view == this.$route.path;
            },
            changeView(newViewPath: string) {
                this.$router.push(newViewPath);
            },
            setDefaultFolder(path: string) {
                this.fsStore.setDefaultOutput(path);
                console.log(this.fsStore.getDefaultOutput);
            },
        }
    }
</script>
<style scoped>
    nav {
        background-color: var(--black-background-850);
        border-bottom: 1px solid var(--black-background-800);
        border-top: 1px solid var(--black-background-800);
        height: 100%;

        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2em;
    }

    .options {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .path-and-settings {
        display: flex;
        align-items: center;
    }

    .header-button {
        padding: .3em 1.1em;
        margin-right: 1em;
    }

</style>