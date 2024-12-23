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
        <o-dropdown class="dropdown-menu" >
            <template #trigger="{ active }">
                <o-button
                    class="base-container dropdown-button"
                    variant="primary"
                    :icon-right="'menu'"/>
            </template>

            <o-dropdown-item
            
                class="dropdown-item"
                label="Open in explorer"

                />

            <o-dropdown-item
                class="dropdown-item"
                label="Restart download"
                
                />

            <o-dropdown-item
                class="dropdown-item alert"
                label="Delete file"
                
                />

        </o-dropdown>
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
        height: 4.5em;
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

    .dropdown-menu {
        --oruga-dropdown-menu-background: var(--black-background-900);
        --oruga-dropdown-item-active-background-color: var(--black-background-900);
        --oruga-dropdown-item-hover-background-color: var(--black-background-850);
    }

    .dropdown-item {
        color: var(--white-text);
        transition: all .2s ease;
        margin: .5em;
        border-radius: 8px;
    }
        .dropdown-item:hover {
            color: var(--white-text);
            transition: all .2s ease;
        }
        .dropdown-item.alert {
            color: var(--red-stroke);
        }
            .dropdown-item.alert:hover {
                color: var(--red-stroke) !important;
            }

    .dropdown-button {
        border: none;
        width: 35px;
        padding: 0em .5em;
    }
        
    .dropdown-button:focus {
        box-shadow: none;
    }
    
    
</style>