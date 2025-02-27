<template>    
  <div data-tauri-drag-region class="titlebar"> <!--TITLE BAR-->
    <div class="titlebar-menu">
      <Menubar data-tauri-drag-region style="padding: 0;" breakpoint="370px" :model="items" />
    </div>
    <div style="display: flex; align-items: center; flex-wrap: nowrap;">
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
  <Toast :position="userConfig.getUserConfig.interface.notificationPosition" group="downloadProgressSummarized">
      <template #container="{message, closeCallback}">
          <div id="DOWNLOAD_TOAST_SUMMARIZED" class="download-toast" >
              <Menu 
                ref="menu" 
                id="overlay_menu" 
                :model="[
                    {
                        label: 'Cancel all downloads',
                        icon: 'pi pi-undo',
                        command: () => {
                            closeCallback();
                            killAllProcess();
                        },
                        class: 'alert'
                    }
                ]" 
                :popup="true" />
              <Button style="position: absolute; right: 1em; top: 1em;" icon="pi pi-times" @click="toggle" variant="text" severity="secondary" />
              <p style="font-weight: 600; font-size: 1.1em;">Download progress:</p>
              <p v-if="loadingStore.getPendingDownloads.length != 0">Downloads pending: {{ loadingStore.getPendingDownloads.length }}</p>
              <p style="margin-bottom: .5em;" >Downloads remaining: {{ loadingStore.getActiveDownloads.length }}</p>
              <ProgressBar :mode="calcSummarizedProgress(loadingStore.getActiveDownloads) == 0 ? 'indeterminate' : 'determinate'" :value="calcSummarizedProgress(loadingStore.getActiveDownloads)??0" />
          </div>
      </template>
  </Toast>
  <Toast :position="userConfig.getUserConfig.interface.notificationPosition" group="downloadProgress">
      <template #container="{message, closeCallback}">
          <div :id="`DOWNLOAD_TOAST_${message.summary}`" v-if="loadingStore.getActiveDownloadById(message.summary)" class="download-toast" >
              <Menu 
                ref="menu" 
                id="overlay_menu" 
                :model="[
                    {
                        label: 'Cancel download',
                        icon: 'pi pi-undo',
                        command: () => {
                            closeCallback();
                            killProcess(message.summary);
                        },
                        class: 'alert'
                    }
                ]" 
                :popup="true" />
              <Button style="position: absolute; right: 1em; top: 1em;" icon="pi pi-times" @click="toggle" variant="text" severity="secondary" />
              <p style="font-weight: 600; font-size: 1.1em;">Download progress:</p>
              <p v-if="(loadingStore.getActiveDownloadById(message.summary)??{} as DownloadInProgress).info != ''" style="font-weight: 400; font-size: .8em; color: var(--surface-500) ; margin-bottom: .9em; width: 80%;">Info: {{ (loadingStore.getActiveDownloadById(message.summary)??{} as DownloadInProgress).info }}</p>
              <ProgressBar :mode="(loadingStore.getActiveDownloadById(message.summary)??{} as DownloadInProgress).progress == '' ? 'indeterminate' : 'determinate'" :value="Number((loadingStore.getActiveDownloadById(message.summary)??{} as DownloadInProgress).progress)" />
          </div>
      </template>
  </Toast>
  <Toast :position="userConfig.getUserConfig.interface.notificationPosition" />
  <div id="main-app">
    <Dialog class="config-modal" v-model:visible="initConfigModalVisible" modal :draggable="false" :closable="false" header="Start app">     
      <Stepper value="1">
        <StepList class="steplist">
            <Step value="1">Terms and Conditions</Step>
            <Step :disabled="!termsAccepted" value="2">Default output folder</Step>
            <Step :disabled="userConfig.getUserConfig.defaultOutput == ''" value="3">Done!</Step>
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
                        :path="userConfig.getUserConfig.defaultOutput"
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
                      <p style="margin: 1em 0;"> For more information and tutorials, access the <button style="text-decoration: underline; color: var(--primary-500);" @click="()=>{openLink('https://github.com/gustavofdasilva/retrieverplusplus')}" >github repository</button> </p>

                      <div style="display: flex; align-items: center;">
                        <p style="margin: 2em .5em; color: var(--surface-600);"> Thank you for choosing Retriever.io</p><span style="color: var(--surface-600);" class="pi pi-heart"></span>
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
    <TheHeader style="height: 80px; z-index: 999;" ref="appHeader" />
    <RouterView/>
  </div>
</template>
<script lang="ts">
import { RouterView } from 'vue-router';
import Home from './views/Home.vue';
import TheHeader from './components/TheHeader.vue';
import Toast from 'primevue/toast';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { initConfigFile, readConfigFile } from './helpers/userConfig';
import { useFSStore } from './stores/fileSystem';
import { useUserConfig } from './stores/userConfig';
import Menubar from 'primevue/menubar';
import titlebarMenuOptions from './constants/titlebarMenuOptions';
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
import { useLoadingStore } from './stores/loading';
import { invoke } from '@tauri-apps/api/core';
import ProgressBar from 'primevue/progressbar';
import Menu from 'primevue/menu';
import { downloadBinaryYtdlp } from './helpers/externalPrograms';


  export default {
    components: {
      Home,
      TheHeader,
      RouterView,
      Toast,
      Menubar,
      Dialog,
      Stepper,
      StepList,
      StepPanels,
      StepPanel,
      Button,
      Step,
      Checkbox,
      BaseFileInput,
      ProgressBar,
      Menu,
    },
    data() {
      return {
        items: titlebarMenuOptions,
        downloadToastItems: [
            {
                label: 'Cancel download',
                icon: 'pi pi-undo',
                command: () => {
                    this.killProcess()
                },
                class: 'alert'
            }
        ],
        initConfigModalVisible: false,
        termsAccepted:false,
      }
    },
    setup() {

      const fileSystem = useFSStore();
      const userConfig = useUserConfig();
      const loadingStore = useLoadingStore();

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
        userConfig,
        loadingStore
      }
    },
    async mounted() {
      this.setItemsCommands();
      await initConfigFile().then((res)=>{
        if(!res) {
          this.initConfigModalVisible = true;
        }
      });
      await readConfigFile().then((userConfig)=>{
        if(userConfig) {
          this.userConfig.setUserConfig(userConfig);
        }
      });
      
      downloadBinaryYtdlp();
    },
    methods: {  
      setItemsCommands() {
        //!Refactor - Set the settings commands
        this.items[0].items[1].command = () => { 
          //@ts-ignore
          this.$refs.appHeader.toggleConfigModalVisible();
        }
      },
      calcSummarizedProgress(downloads: DownloadInProgress[]): number | null {
        let actualProgress = 0;

        downloads.forEach((download: DownloadInProgress)=>{
          if(download.progress == '') {
            return null
          }
          actualProgress += Number(download.progress??0)
        })

        const result = Number(((actualProgress / (downloads.length * 100))*100).toFixed(1));

        return result;

      },
      killAllProcess() {
          this.loadingStore.getActiveDownloads.forEach((download)=>{
            this.loadingStore.setActiveDownloadById(download.id,
              ['cancelled'],
              [true]
            )
          });
          
          let intervalCount=0;
          const intervalId = setInterval(()=>{
              intervalCount++;

              if(intervalCount >= 5) {
                  clearInterval(intervalId);
              }

              invoke('kill_active_process');
          },500)

          
          this.newNotification("Downloads cancelled",3000);
          this.loadingStore.setLoading(false); 
      },
      killProcess(activeDownloadId: string) {
          this.loadingStore.setActiveDownloadById(activeDownloadId,
            ['cancelled'],
            [true]
          )
          let intervalCount=0;
          const intervalId = setInterval(()=>{
              intervalCount++;

              if(intervalCount >= 5) {
                  clearInterval(intervalId);
              }

              invoke('kill_active_process_by_download_id', {
                downloadId: activeDownloadId
              });
          },500)

          
          this.newNotification("Download cancelled",3000);
      },
      toggle(event: any) {
          //@ts-ignore
          this.$refs.menu.toggle(event);
      },
      async setDefaultFolder(path:string) {
          this.userConfig.setUserConfigField('defaultOutput',path);
      },
      async openLink(path:string) {
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
      },
      newNotification(message: string, life: number) {
          this.$toast.add({
              severity: 'secondary',
              summary: 'Download log',
              detail: message,
              life: life,
              closable: true
          })
      },
      closeDownloadProgressToast() {
          this.$toast.removeGroup("downloadProgress");
      },
    }
          
  }
</script>

<style scoped lang="scss"> 
  .download-toast {
      margin: 1.5em 1.2em;
  }
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

  .titlebar-menu {
    width: fit-content; 
    font-size: .8rem; 
    z-index: 10000;

    @media screen and (max-width: 370px) {
      font-size: .9em;
      flex: 1;
    }
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