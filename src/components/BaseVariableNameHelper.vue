<template>
    <div class="variables-title">
        <p>Variables</p>
        <o-tooltip style="margin-top: .4em;" label="Variables to add in file name. See docs for more" :delay="200" position="right" >
            <o-icon
                size="medium"
                icon="information-slab-symbol"/>
        </o-tooltip>
    </div>
    <div class="variable-helper-container">
        <o-button class="btnVar" >Title</o-button>
        <o-button class="btnVar" >Channel</o-button>
        <o-button class="btnVar" >Likes</o-button>
    </div>
</template>
<script lang="ts">
import { useFSStore } from '../stores/fileSystem';
import BaseButton from './BaseButton.vue';
import BaseFileInput from './BaseFileInput.vue';
import BaseIconButton from './BaseIconButton.vue';

    export default {
        name: "BaseVariableNameHelper",
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
    .variable-helper-container {
        width: 100%;
        border: 1px solid var(--black-background-800);
        border-radius: 8px;
        padding: .5em 1em;
    }

    .btnVar {
        color: var(--white-text);
        border: 1px solid var(--black-background-800);
        margin: .5em .3em;
        transition: all .2s ease;
    }
        .btnVar:focus {
            box-shadow: none;
        }
        .btnVar:hover {
            transition: all .2s ease;
            border: 1px solid var(--black-background-700);
        }

    .variables-title {
        margin-top: 1em;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .variables-title p {
        font-size: 1.1em;
    }

</style>