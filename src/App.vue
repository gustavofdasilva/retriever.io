<template>    
  <div data-tauri-drag-region class="titlebar"> <!--TITLE BAR-->
    <div style="width: 50%; font-size: .8rem; z-index: 10000;">
      <Menubar :model="items" />
    </div>
    <div>
      <button class="titlebar-button" id="titlebar-minimize" @click="minimize">
        <i class="pi pi-minus" alt="minimize" ></i>
      </button>
      <button class="titlebar-button" id="titlebar-maximize" @click="maximize">
        <i class="pi pi-expand" alt="maximize"></i>
      </button>
      <button class="titlebar-button" id="titlebar-close" @click="close">
        <i class="pi pi-times" alt="close"></i>
      </button>
    </div>
  </div>
  <Toast position="bottom-right" />
  <div id="main-app">
    <TheHeader style="height: 12vh"/>
    <RouterView/>
  </div>
</template>
<script>
import { RouterView } from 'vue-router';
import Home from './views/Home.vue';
import TheHeader from './components/TheHeader.vue';
import Toast from 'primevue/toast';
import {listen} from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { initConfigFile, readConfigFile } from './helpers/userConfig';
import { useFSStore } from './stores/fileSystem';
import { useUserConfig } from './stores/userConfig';
import Menubar from 'primevue/menubar';
import titlebarMenuOptions from './constants/titlebarMenuOptions';

  export default {
    components: {
      Home,
      TheHeader,
      RouterView,
      Toast,
      Menubar
    },
    data() {
      return {
        items: titlebarMenuOptions
      }
    },
    setup() {

      const fileSystem = useFSStore();
      const userConfig = useUserConfig();

      const appWindow = getCurrentWindow();

      document
        .getElementById('titlebar-minimize')
        ?.addEventListener('click', () => appWindow.minimize());
      document
        .getElementById('titlebar-maximize')
        ?.addEventListener('click', () => appWindow.toggleMaximize());
      document
        .getElementById('titlebar-close')
        ?.addEventListener('click', () => appWindow.close());

      return {
        appWindow,
        fileSystem,
        userConfig
      }
    },
    async mounted() {
      await initConfigFile();
      await readConfigFile().then((userConfig)=>{
        console.log(userConfig);
          this.fileSystem.setDefaultOutput(userConfig.defaultOutput??'');
          this.userConfig.setUserConfig(userConfig);
      });
    },
    methods: {
      minimize() {
        this.appWindow.minimize();
      },
      maximize() {
        this.appWindow.toggleMaximize();
      },
      close() {
        this.appWindow.close();
      }
    }
          
  }
</script>

<style>

</style>