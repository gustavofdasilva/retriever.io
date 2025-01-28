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
    <Dialog class="config-modal" v-model:visible="initConfigModalVisible" modal :draggable="false" :closable="false" header="Start app">     
      <Stepper value="1">
        <StepList class="steplist">
            <Step value="1">Terms and Conditions</Step>
            <Step :disabled="!termsAccepted" value="2">Default output folder</Step>
            <Step :disabled="userConfig.getDefaultOutput == ''" value="3">Done!</Step>
        </StepList>
        <StepPanels>
            <StepPanel style="width: 100%; height: 100%;" v-slot="{ activateCallback }" value="1">
                <div class="steppanel-container">
                    <div class="steppanel-content">
                      <div style="flex: 5;">
                        According to the software license agreement, you must have the right to download the content you are downloading. You personally retain all responsibility for the content downloaded by you. This software is not intended for downloading copyrighted material. See the <button style="text-decoration: underline; color: var(--primary-500);" @click="()=>{openLink('https://www.github.com/yt-dlp/yt-dlp')}" >yt-dlp documentation</button> for more information about using yt-dlp.
                      </div>
                      <div style="flex: 1; display: flex; align-items: center;">            
                        <Checkbox v-model="termsAccepted" inputId="terms" name="terms" binary />
                        <label style="margin-left: .8em;" for="terms"> I agree with the terms </label>
                      </div>
                    </div>
                    <div class="steppanel-buttons" style="justify-content: flex-end;">
                        <Button :disabled="!termsAccepted" label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')" />
                    </div>
                </div>
            </StepPanel>
            <StepPanel style="width: 100%; height: 100%;"  v-slot="{ activateCallback }" value="2">
                <div class="steppanel-container">
                    <div class="steppanel-content">
                      <p style="font-size: 1.5em; margin-bottom: .2em; font-weight: 600;">Select default output folder</p>
                      <p style="color: var(--surface-600); margin-bottom: 2em;" >Set a folder where all downloads (in simple mode) will be downloaded</p>
                      <BaseFileInput 
                        style="margin: 0 1em 0 0; font-size: 0.93em;"
                        :path="userConfig.getDefaultOutput"
                        @folder-selected="setDefaultFolder"/>
                    </div>
                    <div class="steppanel-buttons">    
                      <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                      <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')" />
                    </div>
                </div>
            </StepPanel>
            <StepPanel style="width: 100%; height: 100%;" v-slot="{ activateCallback }" value="3">
                <div class="steppanel-container">
                    <div class="steppanel-content">
                      <p style="font-size: 1.5em; margin-bottom: .2em; font-weight: 600;">All set to start!</p>
                      <p style="margin: 1em 0;"> For more information and tutorials, access the <a href="#" >github repository</a> </p>

                      <div style="display: flex; align-items: center;">
                        <p style="margin: 2em .5em; color: var(--surface-600);"> Thank you for choosing retriever++</p><span style="color: var(--surface-600);" class="pi pi-heart"></span>
                      </div>
                    </div>
                    <div class="steppanel-buttons">    
                      <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                      <Button label="Close" @click="()=>{initConfigModalVisible=false}" />
                    </div>
                </div>
            </StepPanel>
        </StepPanels>
    </Stepper>
    </Dialog>
    <TheHeader style="height: 12vh"/>
    <RouterView/>
  </div>
</template>
<script>
import { RouterView } from 'vue-router';
import Home from './views/Home.vue';
import TheHeader from './components/TheHeader.vue';
import Toast from 'primevue/toast';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { changeConfig, initConfigFile, readConfigFile } from './helpers/userConfig';
import { useFSStore } from './stores/fileSystem';
import { useUserConfig } from './stores/userConfig';
import Menubar from 'primevue/menubar';
import titlebarMenuOptions from './constants/titlebarMenuOptions';
import InitConfigModal from './components/InitConfigModal.vue';
import Dialog from 'primevue/dialog';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanel from 'primevue/steppanel';
import StepPanels from 'primevue/steppanels';
import Button from 'primevue/button';
import Step from 'primevue/step';
import Checkbox from 'primevue/checkbox';
import BaseFileInput from './components/BaseFileInput.vue';
import { open } from '@tauri-apps/plugin-shell';

  export default {
    components: {
      Home,
      TheHeader,
      RouterView,
      Toast,
      Menubar,
      InitConfigModal,
      Dialog,
      Stepper,
      StepList,
      StepPanels,
      StepPanel,
      Button,
      Step,
      Checkbox,
      BaseFileInput
    },
    data() {
      return {
        items: titlebarMenuOptions,
        initConfigModalVisible: false,
        termsAccepted:false,
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
      await initConfigFile().then((res)=>{
        if(!res) {
          this.initConfigModalVisible = true;
        }
      });
      await readConfigFile().then((userConfig)=>{
        console.log(userConfig);
          this.fileSystem.setDefaultOutput(userConfig.defaultOutput??'');
          this.userConfig.setUserConfig(userConfig);
      });
    },
    methods: {  
      async setDefaultFolder(path) {
          this.userConfig.setDefaultOutput(path);
          changeConfig('defaultOutput',path)
      },
      async openLink(path) {
        await open(path)
      },
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

<style scoped> 
  .modal {
    width: 80vw;
    height: 80vh;
    display: flex;
  }

  .p-steplist {
    height: 20%;
  }

  .p-stepper {
    width: 100%;
    margin: 0 2em;
  }

  .p-steppanels {
    height: 80%;
    display: flex;
  }

  .steppanel-container {
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .steppanel-content {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
 
  .steppanel-buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }


</style>