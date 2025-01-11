<template>
  <Toast position="bottom-right" />
  <TheHeader style="height: 12vh;"/>
  <RouterView/>
</template>
<script>
import { RouterView } from 'vue-router';
import Home from './views/Home.vue';
import TheHeader from './components/TheHeader.vue';
import Toast from 'primevue/toast';

  export default {
    components: {
      Home,
      TheHeader,
      RouterView,
      Toast
    }
  }
</script>
<style>

</style>