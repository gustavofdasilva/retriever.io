<template>
    <div style="width: 100%; ">
        <Button :disabled="!changes" :severity="changes ? 'primary' : 'secondary'"  style="position: absolute; bottom: 10px; right: 20px;" @click="saveConfig"  label="Save changes"  />
        <div class="config-options">
            <span>
                Embed thumbnail as cover art by default:
            </span>
            <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end;">
                <ToggleSwitch v-if="newUserConfig.postProcessing" v-model="newUserConfig.postProcessing.embedThumbnailCoverArt" />
            </div>
        </div>
        <div class="config-options">
            <span>
                Embed chapters in the video by default:
            </span>
            <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end;">
                <ToggleSwitch v-if="newUserConfig.postProcessing" v-model="newUserConfig.postProcessing.embedChaptersInVideo" />
            </div>
        </div>
        <div class="config-options">
            <span>
                Embed subtitles in the video:
            </span>
            <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end;">
                <ToggleSwitch v-if="newUserConfig.postProcessing" v-model="newUserConfig.postProcessing.embedSubtitles.enabled" />
            </div>
        </div>
        
        <div v-if="newUserConfig.postProcessing.embedSubtitles.enabled" class="config-options" style="margin-top: -1em; padding-left: 1em;">
            <span>
                Subtitles language:
            </span>
            <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end;">
                <AutoComplete v-if="newUserConfig.metadata" :forceSelection="true" multiple fluid v-model="newUserConfig.postProcessing.embedSubtitles.lang" dropdown :suggestions="filteredLangs" @complete="searchSupportedLangs" />
            </div>
        </div>
    </div>

</template>
<script lang="ts">
import Button from 'primevue/button';
import { useFSStore } from '../../stores/fileSystem';
import { changeConfig, getEmptyUserConfig } from '../../helpers/userConfig';
import ytdlpVariables, { supportedLangs } from '../../constants/ytdlpVariables';
import AutoComplete from 'primevue/autocomplete';
import BaseFileInput from '../BaseFileInput.vue';
import { useUserConfig } from '../../stores/userConfig';
import FloatLabel from 'primevue/floatlabel';
import { audioExtensions, videoExtensions } from '../../constants/fileExtensions';
import ToggleSwitch from 'primevue/toggleswitch';

    export default {
        name: "TheHeader",
        components: {
            BaseFileInput,
            Button,
            AutoComplete,
            FloatLabel,
            ToggleSwitch
        },
        data() {
            return {
                changes: false,
                userConfig: {} as UserConfig,
                newUserConfig: getEmptyUserConfig(),
                variables: ytdlpVariables,
                filteredVariables: [] as string[],
                audioExtensions: audioExtensions,
                filteredAudioExtensions:[] as string[],
                videoExtensions: videoExtensions,
                filteredVideoExtensions:[] as string[],
                filteredLangs: [] as string[],
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
                this.userConfig = JSON.parse(JSON.stringify(userConfig.events.target.userConfig)); 
                this.newUserConfig = JSON.parse(JSON.stringify(this.userConfig));
            });

            this.userConfig = JSON.parse(JSON.stringify(this.userConfigStore.getUserConfig)); //guarantee that is a completely new object with cloned information
            this.newUserConfig = JSON.parse(JSON.stringify(this.userConfig));
        },
        methods: {
            searchSupportedLangs(event:any) {
                this.filteredLangs = event.query ? supportedLangs.filter((item) => {
                    return item.name.toLowerCase().includes(event.query.toLowerCase());
                }).map((item)=>item.name): supportedLangs.map((item)=>item.name);
            },
            compareUserConfigs(obj1: UserConfig, obj2:UserConfig) {
                const keys1 = Object.keys(obj1);
                const keys2 = Object.keys(obj2);

                if (keys1.length !== keys2.length) {
                    console.log("Length different");
                    return true; 
                }

                for (let key of keys1) {
                    if (!keys2.includes(key) || JSON.stringify(obj1[key as keyof UserConfig]) != JSON.stringify(obj2[key as keyof UserConfig])) {
                        console.log(key);
                        return true; 
                    }
                }

                return false;
            },
            async saveConfig() {
                if(this.changes) {
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
            justify-content: space-between;
            margin-bottom: 3em;
        }
            .config-options span {
                margin-right: 1em;
                font-weight: 500;
            }

            .config-options .name-w-label {
                display: flex;
                flex-direction: column;
                align-items: start;
            }
            .config-options .name-w-label p:last-child {
                color: var(--surface-700);
            } 

    input {
        background: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        padding: .4em .9em;
        outline: none;
        transition: all ease .2s;
    }
        
        input:focus, input:hover {
            border-color: var(--black-background-700);
            transition: all ease .2s;
        }


</style>