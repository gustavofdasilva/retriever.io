<template>
    <div class="fileInputContainer" :style="[ pathNotFound ? {border: '1px solid var(--alert)'} : {}]"  >
        <input ref="fileInput" type="file" name="file" id="file" style="display: none;">
        <button v-if="pathNotFound" style="margin-right: .5em;" v-on:click="handleOpen">
            <span v-tooltip.bottom="'Path not found'" style="color: var(--alert);" class="pi pi-exclamation-circle"></span>
        </button>
        <button v-on:click="handleOpen">
            <VueFeather type="folder" size="16" class="icon-grey"/>
        </button>
        <Button 
        @contextmenu="onPathRightClick"
        @click="handleOpen" 
        style="padding: .05em .5em; margin: .05em .5em;"
        :label="path"
        :severity="'secondary'" 
        variant="text" />
        <ContextMenu ref="menu" :model="items" />
    </div>
</template>
<script lang="ts">
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import Button from 'primevue/button';
import ContextMenu from 'primevue/contextmenu';
import { MenuItem } from 'primevue/menuitem';
import VueFeather from 'vue-feather';


export default {
    components: {
        VueFeather,
        Button,
        ContextMenu
    },
    props: {
        path: String,
        dialogTitle: String,
        filter: Array,
        directory: {
            type: Boolean,
            default: true
        },
    },
    data() {
        return {
            pathNotFound: false,
            items: [
                { label: 'Change path', icon: 'pi pi-pencil', command: this.handleOpen },
                { label: 'Open in explorer', icon: 'pi pi-folder-open', command: this.openInExplorer  }
            ] as MenuItem[],
        }
    },
    mounted() {
        this.checkPathExists();
    },
    
    watch: {
        path: {
            handler: function() {
                this.checkPathExists();
            },
            deep: true
        }
    },
    methods: {
        onPathRightClick(event: any) {
            //@ts-ignore
            this.$refs.menu.show(event);
        },
        openInExplorer() {
            invoke('show_in_folder',{path:this.path})
        },
        checkPathExists() {
            try {
                invoke('check_path_exists',{
                    path: this.path ?? 'null'
                }).then((res)=>{
                    console.log(res)
                    this.pathNotFound = !res
                })
            } catch (error) {
                console.log(error)
            }
        },
        async handleOpen() {
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
                //@ts-ignore
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
        border-radius: var(--p-form-field-border-radius);
        border: 1px solid var(--black-background-800);
        font-size: 1em;
        padding: 0.3em 1em;
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