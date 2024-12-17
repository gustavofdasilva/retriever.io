<template>
    <button :class="btnClass" v-on:click="onClickFunc">
        <p>{{ text }}</p>
    </button>
</template>
<script>
export default {
    props: {
        text: {
            type: String,
            default: "text"
        },
        btnClass: {
            type: String,
            default: ""
        },
        onClickFunc: {
            type: Function,
            default: ()=>{}
        },
    }
}
</script>
<style scoped>
    button {
        border-radius: 10px;
        border: 1px solid var(--black-background-700);
        font-size: 1em;
        padding: 0.5em 1em;
        font-weight: 500;
        font-family: inherit;
        color: var(--white-text);
        background-color: var(--black-background-900);
        transition: border-color 0.25s;
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
        cursor: pointer;
    }

    .red {
        background-color: var(--red-fill);
        color: var(--red-stroke);
        border-color: var(--red-stroke);
    }
</style>