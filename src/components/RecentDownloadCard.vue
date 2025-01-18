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
            <o-dropdown class="dropdown-menu" >
                <template #trigger="{}">
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
            length: String,
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