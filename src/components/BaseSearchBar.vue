<template>
    <div class="search-bar-container">
        <template v-if="multiline" >
            <textarea v-model="inputText" type="text" name="text" id="text" placeholder="Paste your urls (Separated by enter)..." :rows="rows"></textarea>
        </template>
        <template v-else>
            <input v-model="inputText" type="text" name="text" id="text" placeholder="Paste your url...">
        </template>
        <!-- <BaseIconButton :disabled="disabled" btnIcon="search" :btnBorder="true" style="position: absolute; right: 10px;" :onClickFunc="()=>{emitOnClick()}" /> -->
        <Button icon="pi pi-search" severity="primary" variant="text" style="position: absolute; right: 10px; " @click="emitOnClick" />
    </div>
</template>
<script>
import BaseIconButton from './BaseIconButton.vue';
import { useMediaStore } from '../stores/media';
import { useLoadingStore } from '../stores/loading';
import Button from 'primevue/button';

export default {
    components: {
        BaseIconButton,
        Button
    },
    props: {
        rows: {
            type: Number,
            default: 5
        },
        disabled: {
            type: Boolean,
            default: false
        },
        multiline: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            inputText: '',
            basicMetadata: ''
        }
    },
    setup() {
      const mediaStore = useMediaStore()  
      const loadingStore = useLoadingStore()

      return {
        mediaStore,
        loadingStore
      }
    },
    methods: {
        emitOnClick() {
            this.$emit('on-click-func',this.inputText)
        }
    }
}
</script>
<style scoped>
    .search-bar-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
    }

    input, textarea {
        width: 100%;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        padding: 0.9em 1em;
        color: var(--white-text);
        outline: none;
        resize: none;
        transition: all ease .2s;
    }
        input:hover, textarea:hover, input:focus, textarea:focus {
            border: 1px solid var(--surface-700);
            transition: all ease .2s;
        }

</style>