<template>
    <div class="fileInputContainer">
        <input ref="fileInput" type="file" name="file" id="file" style="display: none;">
        <button v-on:click="handleOpen">
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
        VueFeather,
    },
    props: {
        path: String,
        dialogTitle: String,
        filter: Array,
        directory: {
            type: Boolean,
            default: true
        }
    },
    setup() {
        const fsStore = useFSStore();

        return {
            fsStore
        }
    },
    methods: {
        async handleOpen() {
            console.log(this.directory);
            if(this.directory) {
                await this.openInput()
            } else {
                await this.openFileInput();
            }
        },
        async openInput() {
            const dir = await open({
                directory: true,
                title: this.dialogTitle ? this.dialogTitle : 'Select default output',
            })
            if(dir==null) return

            this.$emit('folder-selected',dir)
        },
        async openFileInput() {
            const file = await open({
                directory: false,
                title: this.dialogTitle ? this.dialogTitle : 'Select a valid .txt of cookies',
                filters: this.filter ? this.filter : [{
                    name: 'Text file',
                    extensions: ['txt']
                }]
            });
            
            if(file==null) return

            this.$emit('folder-selected',file)
        }
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
        font-size: 1.1em;
        justify-content: space-between;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .fileInputContainer {
        min-height: 42px;
        border-radius: var(--p-form-field-border-radius);
        border: 1px solid var(--black-background-800);
        font-size: 1em;
        padding: 0.5em 1em;
        font-family: inherit;
        color: var(--white-text);
        background-color: var(--black-background-900);
        transition: border-color 0.25s;
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        max-width: 100%;
    }
        .fileInputContainer:hover {
            border-color: var(--surface-700);
        }

    .red {
        background-color: var(--red-fill);
        color: var(--red-stroke);
        border-color: var(--red-stroke);
    }
</style>