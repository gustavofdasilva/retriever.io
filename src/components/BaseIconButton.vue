<template>
    <button :class="checkBorder() + (disabled ? ' disabled' : '')" v-on:click="onClickFunc" :disabled="disabled" >
        <VueFeather :type="btnIcon" size="24" :class="checkBorder()"/>
    </button>
</template>
<script>
import VueFeather from 'vue-feather';

export default {
    components: {
        VueFeather
    },
    props: {
        btnWidth: String,
        btnHeight: String,
        btnIcon: String,
        btnBorder: Boolean,
        onClickFunc: Function,
        disabled: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        checkBorder() {
            return this.btnBorder ? 'border-btn' : 'icon-white';
        }
    }
}
</script>
<style scoped>
    button {
        background-color: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.2em;
    }

    button.border-btn {
        background-color: var(--red-fill) !important;
        border: 1px solid var(--red-stroke);
        border-radius: 8px;
        color: var(--red-stroke) !important;
        transition: all ease .2s;
    }
        button.border-btn:hover {
            border-color: var(--red-stroke-hover);
            color: var(--red-stroke-hover);
            transition: all ease .2s;
        }
    
    img { 
        height: 100%;
        width: 100%;
    }
</style>