<template>
    <div class="recent-card-container">
        <div :style="{'background-image': 'url('+thumbnailUrl+')'}" class="thumbnail"></div>
        <div>
            <p style="font-weight: bold;">
                {{ title }}
            </p>
        </div>
        <div>
            <p>
                {{ channel }}
            </p>
        </div>
        <div>
            <p >
               {{ quality }}
            </p>
        </div>
        <div>
            <p>
                {{format}}
            </p>
        </div>
        <div>
            <p>
                {{ length }}
            </p>
        </div>
        <div >
            <Button severity="secondary" variant="text" type="button" icon="pi pi-ellipsis-v" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" />
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
        </div>
    </div>
</template>
<script>
import Button from 'primevue/button';
import BaseIconButton from './BaseIconButton.vue';
import Menu from 'primevue/menu';
import { ref } from 'vue';


    export default {
        components: {
            BaseIconButton,
            Button,
            Menu
        },
        props: {
            thumbnailUrl: String,
            title: String,
            channel: String,
            quality: String,
            format: String,
            length: String,
        },
        data() {
            return {
                items: [
                    {
                        label: 'Open in explorer',
                        icon: 'pi pi-folder-open',
                        command: () => {
                            console.log("Open in explorer")
                        }
                    },
                    {
                        label: 'Restart download',
                        icon: 'pi pi-replay',
                        command: () => {
                            console.log("Restart download")
                        }
                    },
                    {
                        label: 'Delete file',
                        icon: 'pi pi-trash',
                        command: () => {
                            console.log("Delete file")
                        },
                        class: 'alert'
                    }
                ]
            }
        },
        methods: {
            formatLength() {

            },
            toggle(event) {
                this.$refs.menu.toggle(event);
            }
        }
    }

</script>

<style scoped>
    .recent-card-container {
        justify-self: center;
        width: 100%;
        height: 4.5em;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        padding: 0.5em .8em;
        margin: 0.5em 0.5em;

        display: grid;
        grid-template-columns: 1.2fr repeat(2, 2fr) repeat(4, 1fr);
        grid-template-rows: 1fr;
        grid-column-gap: 15px;
    }
        .recent-card-container div {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: start;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            
        }

    .thumbnail {
        background-image: url(https://placehold.co/600x400);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        border-radius: 8px;
    }

    a:hover {
        color: unset;
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