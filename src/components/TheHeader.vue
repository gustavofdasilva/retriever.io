<template>
    <nav>
        <Dialog class="config-modal" v-model:visible="configModalVisible" :draggable="false" modal header="Settings">
            <div class="config-sidebar">
                <div>
                    <Button style="width: 100%;" @click="configModalView = 'General'"  label="General" :severity="configModalView == 'General' ? 'primary' : 'secondary'" />
                    <Button style="width: 100%;" @click="configModalView = 'Interface'"  label="Interface" :severity="configModalView == 'Interface' ? 'primary' : 'secondary'" />
                    <Button style="width: 100%;" @click="configModalView = 'Downloads'"  label="Downloads" :severity="configModalView == 'Downloads' ? 'primary' : 'secondary'" />
                    <Button style="width: 100%;" @click="configModalView = 'Postprocessing'"  label="Postprocessing" :severity="configModalView == 'Postprocessing' ? 'primary' : 'secondary'" />
                    <Button style="width: 100%;" @click="configModalView = 'Metadata'"  label="Metadata" :severity="configModalView == 'Metadata' ? 'primary' : 'secondary'" />
                    <Button style="width: 100%;" @click="configModalView = 'About'"  label="About" :severity="configModalView == 'About' ? 'primary' : 'secondary'" />
                </div>
                <div>
                    <p style="color: var(--surface-700);">
                        Retriever ++
                    </p>
                </div>
            </div>
            <Tabs v-model:value="configModalView" class="config-content" style="overflow-y: auto;">
                <TabPanels>
                    <TabPanel value="General">
                        <GeneralTab v-if="configModalView == 'General'" /> <!--v-if to force unmount-->
                    </TabPanel>
                    <TabPanel value="Downloads">
                        <DownloadsTab v-if="configModalView == 'Downloads'"/>
                    </TabPanel>
                    <TabPanel value="Postprocessing">
                        <PostProcessingTab v-if="configModalView == 'Postprocessing'"/>
                    </TabPanel>
                    <TabPanel value="Metadata">
                        <MetadataTab v-if="configModalView == 'Metadata'"/>
                    </TabPanel>
                    <TabPanel value="About">
                        <AboutTab v-if="configModalView == 'About'"/>
                    </TabPanel>
                    <TabPanel value="Interface">
                        <InterfaceTab v-if="configModalView == 'Interface'"/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Dialog>
        <Dialog class="accounts-modal" v-model:visible="accountsModalVisible" :draggable="false" modal header="Authentication">
            <AuthenticationModal/>
        </Dialog>
        <div class="options">
            <img src="../assets/vue.svg" alt="logo"/>
            <div style="margin-left: 2em;">
                <Button class="btn-page"  label="Simple" :severity="checkView('/') ? 'primary' : 'secondary'" @click="()=>{changeView('/')}" />
                <Button class="btn-page"  label="Detailed"  :severity="checkView('/singleDetailed') ? 'primary' : 'secondary'" @click="()=>{changeView('/singleDetailed')}" />
                <Button class="btn-page"  label="Multiple" :severity="checkView('/multiple') ? 'primary' : 'secondary'" @click="()=>{changeView('/multiple')}"  />
                <Button class="btn-page"  label="Multiple detailed" :severity="checkView('/multipleDetailed') ? 'primary' : 'secondary'" @click="()=>{changeView('/multipleDetailed')}"  />
            </div>
        </div>
        <div class="path-and-settings">
            <BaseFileInput 
                style="margin: 0 1em 0 0; font-size: 0.93em;"
                :path="userConfigStore.userConfig.defaultOutput"
                @folder-selected="setDefaultFolder"/>
                <Button icon="pi pi-download" class="btn-page" style=" margin-right: .5em;" variant="text" :severity="checkView('/downloads') ? 'primary' : 'secondary'" @click="()=>{changeView('/downloads')}"  />
                <Button icon="pi pi-user" @click="()=>accountsModalVisible=true" style=" margin-right: .5em;"  variant="text" size="large" severity="secondary" />
                <Button icon="pi pi-cog" @click="()=>configModalVisible=true" variant="text" size="large" severity="secondary" />
        </div>
    </nav>
</template>
<script lang="ts">
import Button from 'primevue/button';
import { useFSStore } from '../stores/fileSystem';
import BaseButton from './BaseButton.vue';
import BaseFileInput from './BaseFileInput.vue';
import BaseIconButton from './BaseIconButton.vue';
import { changeConfig, deleteConfig, readConfigFile } from '../helpers/userConfig';
import Dialog from 'primevue/dialog';
import Tabs from 'primevue/tabs';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import ytdlpVariables from '../constants/ytdlpVariables';
import AutoComplete, { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import { useUserConfig } from '../stores/userConfig';
import DownloadsTab from './userConfigModal/DownloadsTab.vue';
import AccountsContainer from './accountsModal/AccountsContainer.vue';
import { filterArray } from '../helpers/miscFuncs';
import { browser } from '../constants/browser';
import FloatLabel from 'primevue/floatlabel';
import ToggleSwitch from 'primevue/toggleswitch';
import { findConfigCode } from '../helpers/download';
import AuthenticationModal from './accountsModal/AuthenticationModal.vue';
import GeneralTab from './userConfigModal/GeneralTab.vue';
import PostProcessingTab from './userConfigModal/PostProcessingTab.vue';
import MetadataTab from './userConfigModal/MetadataTab.vue';
import AboutTab from './userConfigModal/AboutTab.vue';
import InterfaceTab from './userConfigModal/InterfaceTab.vue';

    export default {
        name: "TheHeader",
        components: {
            BaseButton,
            BaseFileInput,
            BaseIconButton,
            Button,
            Dialog,
            Tabs,
            TabPanel,
            TabPanels,
            AutoComplete,
            DownloadsTab,
            GeneralTab,
            PostProcessingTab,
            MetadataTab,
            AboutTab,
            AccountsContainer,
            FloatLabel,
            ToggleSwitch,
            AuthenticationModal,
            InterfaceTab
        },
        data() {
            return {
                activeView: 'home',
                configModalVisible: false,
                accountsModalVisible: false,
                enableAuth: false,
                configModalView: 'Downloads',
                changes: false,
                message: '',
                userConfig: {} as UserConfig,
                newUserConfig: {} as UserConfig,
                variables: ytdlpVariables,
                filteredVariables: [] as string[],
                filteredBrowsers: [] as string[],
                browser: '',
            }
        },
        setup() {
            const fsStore = useFSStore()
            const userConfigStore = useUserConfig();
            const changeUserConfig = (config: keyof UserConfig, value: UserConfig[keyof UserConfig]) => changeConfig(config,value);

            return {
                changeUserConfig,
                fsStore,
                userConfigStore
            }
        },
        watch: {
            newUserConfig: {
                handler: function(val) {
                    this.changes = this.compareUserConfigs(this.userConfig, val);
                },
                deep: true
            }
        },
        methods: {
            async setBrowser() {
                let auth = this.userConfigStore.getUserConfig.authentication ?? {} as UserAuthentication;

                auth.cookiesFromBrowser = findConfigCode(this.browser,browser) ;

                await this.userConfigStore.setUserConfigField('authentication',auth);
            },
            async toggleEnableAuth() {
                let auth = this.userConfigStore.getUserConfig.authentication ?? {} as UserAuthentication;

                auth.enabled = this.enableAuth;

                await this.userConfigStore.setUserConfigField('authentication',auth);
            },
            searchBrowser(event: AutoCompleteCompleteEvent) {
                this.filteredBrowsers = filterArray(event,browser);
            },
            deleteConfigHandle() {
             deleteConfig()   
            },
            compareUserConfigs(obj1: UserConfig, obj2:UserConfig) {
                const keys1 = Object.keys(obj1);
                const keys2 = Object.keys(obj2);

                console.log("Compare")
                if (keys1.length !== keys2.length) {
                    console.log("Length different");
                    return true; 
                }

                for (let key of keys1) {
                    if (!keys2.includes(key) || obj1[key as keyof UserConfig] != obj2[key as keyof UserConfig]) {
                        console.log(key);
                        return true; 
                    }
                }

                return false;
            },
            async saveConfig() {
                if(this.changes) {
                    await this.changeUserConfig('defaultFileName', this.newUserConfig.defaultFileName);
                    await this.changeUserConfig('defaultOutput', this.newUserConfig.defaultOutput);
                    this.userConfigStore.setUserConfig(this.newUserConfig);
                    this.configModalVisible = false;
                }
            },
            toggleConfigModalVisible() {
                this.configModalVisible = !this.configModalVisible;
            },
            checkView(view: string) {
                console.log(this.$route.path);
                return view == this.$route.path;
            },
            changeView(newViewPath: string) {
                this.$router.push(newViewPath);
            },
            setDefaultFolderUserConfig(path: string) {
                this.newUserConfig.defaultOutput = path;

            },
            async setCoookiesTxtFile(path: string)  {
                let auth = this.userConfigStore.getUserConfig.authentication ?? {} as UserAuthentication;

                auth.cookiesTxtFilePath = path;

                await this.userConfigStore.setUserConfigField('authentication',auth);
            },
            setDefaultFolder(path: string) {
                this.userConfigStore.setUserConfigField('defaultOutput',path);
            },

            search(event:any) {
                setTimeout(() => {
                    const querySplit = event.query.split(/[-._ ]/g)
                    const queryValue = querySplit[querySplit.length-1]
                    if (!event.query.trim().length) {
                        this.filteredVariables = [];
                    } else {
                        this.filteredVariables = this.variables.filter((variable) => {
                            return variable.label.toLowerCase().startsWith(queryValue.toLowerCase()) || variable.value == queryValue;
                        }).map(val=>val.label);
                    }
                }, 250);
            },
        }
    }
</script>
<style scoped>
    nav {
        background-color: var(--black-background-850);
        border-bottom: 1px solid var(--black-background-800);
        height: 100%;

        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2em;
    }

    .options {
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 0;
    }
        .options button {
            margin-right: 1em;
        }

    .path-and-settings {
        display: flex;
        align-items: center;
    }

    .header-button {
        padding: .3em 1.1em;
        margin-right: 1em;
    }

    .btn-page {
        padding: .3em 1em;
    }

    .config-sidebar {
        border-right: 1px solid var(--surface-700);
        padding-right: 1.25rem;
        margin-right: 1em;
        display: flex;
        width: 25%;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }
        .config-sidebar button {
            margin: .2em 0;
        }

    .config-content {
        width: 100%;
        height: 90%;
        box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
    }

    .config-content::-webkit-scrollbar {
    width: 6px;
    }

        .account-container {
            margin-left: 1em;
            margin-right: 1em;
            margin-top: .5em;
        }


        .config-content .cookies-container {
            width: 80%;
            margin: 1em auto 4em auto;
        }

        .config-options {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin-bottom: 2em;
        }
            .config-options span {
                margin-right: 1em;
                font-weight: 500;
            }


</style>