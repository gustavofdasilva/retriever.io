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
import {listen} from '@tauri-apps/api/event';

  export default {
    components: {
      Home,
      TheHeader,
      RouterView,
      Toast
    },
    setup() {
      listen('download-progress',(event)=>{
        console.log(event);
      })
    }
  }
</script>

<style>

</style>