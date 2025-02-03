<template>
    <nav>
        <Dialog class="config-modal" v-model:visible="configModalVisible" :draggable="false" modal header="Settings">
            <div class="config-sidebar">
                <div>
                    <Button style="width: 100%;" @click="configModalView = 'Downloads'"  label="Downloads" :severity="configModalView == 'Downloads' ? 'primary' : 'secondary'" />
                    <Button style="width: 100%;" @click="configModalView = 'Theme'"  label="Theme" :severity="configModalView == 'Theme' ? 'primary' : 'secondary'" />
                    <Button style="width: 100%;" @click="configModalView = 'About'"  label="About" :severity="configModalView == 'About' ? 'primary' : 'secondary'" />
                </div>
                <div>
                    <p style="color: var(--surface-700);">
                        Retriever ++
                    </p>
                </div>
            </div>
            <Tabs v-model:value="configModalView" class="config-content" >
                <TabPanels>
                    <TabPanel value="Downloads">
                        <DownloadsTab/>
                    </TabPanel>
                    <TabPanel value="Theme">
                        <p>
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                            ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                        </p>
                    </TabPanel>
                    <TabPanel value="About">
                        <p>
                            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa
                            qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                        </p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Dialog>
        <Dialog class="accounts-modal" v-model:visible="accountsModalVisible" :draggable="false" modal header="Accounts">
            <div class="config-content">
                <p style="color: var(--surface-400);">Create Accounts to use a login in a website. If a website requires the user to login, you can specify the website, username and password by registering this account here.</p>
                <AccountsContainer/>
            </div>
        </Dialog>
        <div class="options">
            <img src="../assets/vue.svg" alt="logo"/>
            <div style="margin-left: 2em;">
                <!-- <BaseButton text="Simple" :btnClass="(checkView('/') ? 'red' : '') + ' header-button'" :onClickFunc="()=>{changeView('/')}"/>
                <BaseButton text="Detailed" :btnClass="(checkView('/singleDetailed') ? 'red' : '') + ' header-button'"  :onClickFunc="()=>{changeView('/singleDetailed')}"/>
                <BaseButton text="Multiple" :btnClass="(checkView('/multiple') ? 'red' : '') + ' header-button'"  :onClickFunc="()=>{changeView('/multiple')}"/> -->
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
import AutoComplete from 'primevue/autocomplete';
import { useUserConfig } from '../stores/userConfig';
import DownloadsTab from './userConfigModal/DownloadsTab.vue';
import AccountsContainer from './accountsModal/AccountsContainer.vue';

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
            AccountsContainer
        },
        data() {
            return {
                activeView: 'home',
                configModalVisible: false,
                accountsModalVisible: false,
                configModalView: 'Downloads',
                changes: false,
                message: '',
                userConfig: {} as UserConfig,
                newUserConfig: {} as UserConfig,
                variables: ytdlpVariables,
                filteredVariables: [] as string[],
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
            setDefaultFolder(path: string) {
                this.changeUserConfig('defaultOutput', path);
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
        height: 100%;
        position: relative;
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