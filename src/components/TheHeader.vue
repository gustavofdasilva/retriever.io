<template>
    <nav>
        <Dialog class="config-modal" v-model:visible="configModalVisible" modal header="Settings">
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
                <Button :disabled="!changes" :severity="changes ? 'primary' : 'secondary'"  style="position: absolute; bottom: 0; right: 0;" @click="saveConfig"  label="Save changes"  />
                <TabPanels>
                    <TabPanel value="Downloads">
                        <div class="config-options">
                            <span>
                                Default download folder:
                            </span>
                            <BaseFileInput 
                            style="margin: 0 1em 0 0; font-size: 0.93em;"
                            :path="newUserConfig.defaultOutput"
                            @folder-selected="setDefaultFolderUserConfig"/>
                        </div>
                        <div class="config-options">
                            <span style="margin-bottom: .5em;">
                                Default output file name:
                            </span>
                            <AutoComplete style="flex:1" class="suggestions-input" v-model="newUserConfig.defaultFileName" :showEmptyMessage="false" :suggestions="filteredVariables" @complete="search" 
                                :pt="{
                                    root(root) {
                                        root.instance.onOptionSelect = (event: any, option:any) => {
                                            let optionArray = Array.from(option)
                                            const varValue = variables.find((el:any)=>el.label==option)

                                            for (let i = 0; i < optionArray.length; i++) {
                                                console.log(optionArray.slice(0,i+1).join(''))
                                                const fragmentedString = optionArray.slice(0,i+1).join('').toLowerCase()
                                                if(newUserConfig.defaultFileName.toLowerCase().endsWith(fragmentedString)) {
                                                    newUserConfig.defaultFileName = newUserConfig.defaultFileName.slice(0,-(i+1))
                                                    newUserConfig.defaultFileName += varValue?.value ?? option;
                                                    return
                                                }
                                            }

                                            newUserConfig.defaultFileName+=varValue?.value??option;
                                            
                                        }
                                    },
                                }"
                            />
                        </div>
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
        <div class="options">
            <img src="../assets/vue.svg" alt="logo"/>
            <div style="margin-left: 2em;">
                <!-- <BaseButton text="Simple" :btnClass="(checkView('/') ? 'red' : '') + ' header-button'" :onClickFunc="()=>{changeView('/')}"/>
                <BaseButton text="Detailed" :btnClass="(checkView('/singleDetailed') ? 'red' : '') + ' header-button'"  :onClickFunc="()=>{changeView('/singleDetailed')}"/>
                <BaseButton text="Multiple" :btnClass="(checkView('/multiple') ? 'red' : '') + ' header-button'"  :onClickFunc="()=>{changeView('/multiple')}"/> -->
                <Button label="Simple" :severity="checkView('/') ? 'primary' : 'secondary'" @click="()=>{changeView('/')}" />
                <Button label="Detailed"  :severity="checkView('/singleDetailed') ? 'primary' : 'secondary'" @click="()=>{changeView('/singleDetailed')}" />
                <Button label="Multiple" :severity="checkView('/multiple') ? 'primary' : 'secondary'" @click="()=>{changeView('/multiple')}"  />
            </div>
        </div>
        <div class="path-and-settings">
            <BaseFileInput 
                style="margin: 0 1em 0 0; font-size: 0.93em;"
                :path="fsStore.getDefaultOutput"
                @folder-selected="setDefaultFolder"/>
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
import { changeConfig, readConfigFile } from '../helpers/userConfig';
import Dialog from 'primevue/dialog';
import Tabs from 'primevue/tabs';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import ytdlpVariables from '../constants/ytdlpVariables';
import AutoComplete from 'primevue/autocomplete';
import { useUserConfig } from '../stores/userConfig';

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
            AutoComplete
        },
        data() {
            return {
                activeView: 'home',
                configModalVisible: false,
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
            const changeUserConfig = (config: string, value: string) => changeConfig(config,value);

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
        mounted() {
            this.userConfigStore.$subscribe((userConfig) => {
                //@ts-ignore
                this.userConfig = userConfig.events.target;
                this.newUserConfig = {...this.userConfig};
            });
        },
        methods: {
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
                    this.fsStore.setDefaultOutput(this.newUserConfig.defaultOutput);
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
                this.fsStore.setDefaultOutput(path);
                console.log(this.fsStore.getDefaultOutput);
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