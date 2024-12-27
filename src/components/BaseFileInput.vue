<template>
    <div class="container">
        <input ref="fileInput" type="file" name="file" id="file" style="display: none;">
        <button v-on:click="openInput">
            <VueFeather type="folder" size="16" class="icon-grey"/>
        </button>
        <p>
            {{ path }}
        </p>
    </div>
</template>
<script>
import { open } from '@tauri-apps/plugin-dialog';
import VueFeather from 'vue-feather';
import { useFSStore } from '../stores/fileSystem';


export default {
    components: {
        VueFeather
    },
    data() {
        return {
            path: ''
        }
    },
    setup() {
        const fsStore = useFSStore();

        return {
            fsStore
        }
    },
    mounted() {
        if(this.fsStore.getDefaultOutput != '') {
            this.path = this.fsStore.getDefaultOutput;
        }
    },
    methods: {
        async openInput() {
            const dir = await open({
                directory: true,
                title:'Select default output'
            })
            this.path = dir
            this.$emit('folder-selected',this.path)
        },
    }
}
</script>
<style scoped>
    button {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
    }

    p {
        margin-left: 10px;
    }

    .container {
        border-radius: 10px;
        border: 1px solid var(--black-background-800);
        font-size: 1em;
        padding: 0.5em 1em;
        font-weight: 500;
        font-family: inherit;
        color: var(--white-text);
        background-color: var(--black-background-900);
        transition: border-color 0.25s;
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .red {
        background-color: var(--red-fill);
        color: var(--red-stroke);
        border-color: var(--red-stroke);
    }
</style>