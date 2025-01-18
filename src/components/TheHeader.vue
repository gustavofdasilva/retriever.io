<template>
    <nav>
        <div class="options">
            <img src="../assets/vue.svg" alt="logo"/>
            <div style="margin-left: 2em;">
                <!-- <BaseButton text="Simple" :btnClass="(checkView('/') ? 'red' : '') + ' header-button'" :onClickFunc="()=>{changeView('/')}"/>
                <BaseButton text="Detailed" :btnClass="(checkView('/singleDetailed') ? 'red' : '') + ' header-button'"  :onClickFunc="()=>{changeView('/singleDetailed')}"/>
                <BaseButton text="Multiple" :btnClass="(checkView('/multiple') ? 'red' : '') + ' header-button'"  :onClickFunc="()=>{changeView('/multiple')}"/> -->
                <Button label="Simple" :severity="checkView('/') ? 'primary' : 'secondary'" @click="()=>{changeView('/')}" />
                <Button label="Detailed"  :severity="checkView('/singleDetailed') ? 'primary' : 'secondary'" @click="()=>{changeView('/singleDetailed')}" />
                <Button label="Multiple" :severity="checkView('/multiple') ? 'primary' : 'secondary'" @click="()=>{changeView('/multiple')}"  />
            </div>
        </div>
        <div class="path-and-settings">
            <BaseFileInput 
                style="margin: 0 1em 0 0; font-size: 0.93em;"
                @folder-selected="setDefaultFolder"/>
                <Button icon="pi pi-cog" @click="()=>console.log('CONFIG')" variant="text" size="large" severity="secondary" />
        </div>
    </nav>
</template>
<script lang="ts">
import Button from 'primevue/button';
import { useFSStore } from '../stores/fileSystem';
import BaseButton from './BaseButton.vue';
import BaseFileInput from './BaseFileInput.vue';
import BaseIconButton from './BaseIconButton.vue';

    export default {
        name: "TheHeader",
        components: {
            BaseButton,
            BaseFileInput,
            BaseIconButton,
            Button
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
        .options button {
            margin-right: 1em;
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