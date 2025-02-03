<template>
    <div style="width: 85%;">
        <Button :disabled="!changes" :severity="changes ? 'primary' : 'secondary'"  style="position: absolute; bottom: 0; right: 0;" @click="saveConfig"  label="Save changes"  />
        <div class="config-options">
            <span>
                Default download folder:
            </span>
            <BaseFileInput 
            style="font-size: 0.93em; width: 100%;"
            :path="newUserConfig.defaultOutput"
            @folder-selected="setDefaultFolderUserConfig"/>
        </div>
        <div class="config-options">
            <span style="margin-bottom: .5em;">
                Default output file name:
            </span>
            <AutoComplete style="flex:1" class="suggestions-input" v-model="newUserConfig.defaultFileName" :showEmptyMessage="false" :suggestions="filteredVariables" @complete="search" 
                :pt="{
                    root(root:any) {
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
        <div class="config-options">
            <span>Default audio file extension:</span>
            <AutoComplete fluid inputId="quality_dropdown" v-model="newUserConfig.defaultAudioFormat" dropdown :suggestions="filteredAudioExtensions" @complete="searchAudioExt" />
        </div>
        <div class="config-options">
            <span>Default video file extension:</span>
            <AutoComplete fluid inputId="quality_dropdown" v-model="newUserConfig.defaultVideoFormat" dropdown :suggestions="filteredVideoExtensions" @complete="searchVideoExt" />
        </div>
    </div>

</template>
<script lang="ts">
import Button from 'primevue/button';
import { useFSStore } from '../../stores/fileSystem';
import { changeConfig } from '../../helpers/userConfig';
import ytdlpVariables from '../../constants/ytdlpVariables';
import AutoComplete from 'primevue/autocomplete';
import BaseFileInput from '../BaseFileInput.vue';
import { useUserConfig } from '../../stores/userConfig';
import FloatLabel from 'primevue/floatlabel';
import { audioExtensions, videoExtensions } from '../../constants/fileExtensions';

    export default {
        name: "TheHeader",
        components: {
            BaseFileInput,
            Button,
            AutoComplete,
            FloatLabel
        },
        data() {
            return {
                changes: false,
                userConfig: {} as UserConfig,
                newUserConfig: {} as UserConfig,
                variables: ytdlpVariables,
                filteredVariables: [] as string[],
                audioExtensions: audioExtensions,
                filteredAudioExtensions:[] as string[],
                videoExtensions: videoExtensions,
                filteredVideoExtensions:[] as string[],
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
        mounted() {
            this.userConfigStore.$subscribe((userConfig) => {
                //@ts-ignore
                this.userConfig = userConfig.events.target.userConfig;
                this.newUserConfig = {...this.userConfig};
                console.log(this.newUserConfig);
            });
            this.userConfig = this.userConfigStore.getUserConfig;
            this.newUserConfig = {...this.userConfig};
        },
        methods: {
            searchAudioExt(event:any) {
                this.filteredAudioExtensions = event.query ? this.audioExtensions.filter((quality) => {
                    return quality.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): this.audioExtensions.map((item)=>item.name);
            },
            searchVideoExt(event:any) {
                this.filteredVideoExtensions = event.query ? this.videoExtensions.filter((quality) => {
                    return quality.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): this.videoExtensions.map((item)=>item.name);
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
                    await this.changeUserConfig('defaultAudioFormat', this.newUserConfig.defaultAudioFormat);
                    await this.changeUserConfig('defaultVideoFormat', this.newUserConfig.defaultVideoFormat);
                    this.fsStore.setDefaultOutput(this.newUserConfig.defaultOutput);
                    this.userConfigStore.setUserConfig(this.newUserConfig);
                    this.$emit('setConfigModalVisible', false);
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