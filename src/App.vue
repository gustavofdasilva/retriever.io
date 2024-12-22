<template>
  <TheHeader style="height: 12vh;"/>
  <RouterView/>
</template>
<script>
import { RouterView } from 'vue-router';
import Home from './views/Home.vue';
import TheHeader from './components/TheHeader.vue';

  export default {
    components: {
      Home,
      TheHeader,
      RouterView
    }
  }
</script>
<style>

</style>