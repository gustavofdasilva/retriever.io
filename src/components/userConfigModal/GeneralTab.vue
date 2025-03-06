<template>
    <div style="width: 100%;">
        <Dialog v-model:visible="clearRecentDownloadsVisible" modal header="Are you sure?" style="width: 30%;" >
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <p style="text-align: center;">
                    This action will delete ALL recent downloads from the system, restarting the app. Are you sure you want to proceed?
                </p>
                <Button @click="deleteRecentDownloads" style="width: 100%; margin-top: 1em;" label="Confirm" severity="danger" outlined />
            </div>
        </Dialog>
        <Dialog v-model:visible="clearUserConfigVisible" modal header="Are you sure?" style="width: 30%;" >
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <p style="text-align: center;">
                    This action will delete ALL user config from the system, completely reseting the app and restarting. Are you sure you want to proceed?
                </p>
                <Button @click="deleteUserConfig" style="width: 100%; margin-top: 1em;" label="Confirm" severity="danger" outlined />
            </div>
        </Dialog>
        <Dialog v-model:visible="reloadYtdlpVisible" modal header="Are you sure?" style="width: 30%;" >
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <p style="text-align: center;">
                    This action will delete the yt-dlp binary and download the latest version. Are you sure you want to proceed?
                </p>
                <Button @click="reloadYtdlp" style="width: 100%; margin-top: 1em;" label="Confirm" severity="danger" outlined />
            </div>
        </Dialog>
        <Dialog v-model:visible="reloadFfmpegVisible" modal header="Are you sure?" style="width: 30%;" > <!--Refactor: These 3 dialogs of binaries have basically the same structure-->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <p style="text-align: center;">
                    This action will delete the ffmpeg binary and download the latest version. Are you sure you want to proceed?
                </p>
                <Button @click="reloadFfmpeg" style="width: 100%; margin-top: 1em;" label="Confirm" severity="danger" outlined />
            </div>
        </Dialog>
        <Dialog v-model:visible="reloadFfprobeVisible" modal header="Are you sure?" style="width: 30%;" >
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <p style="text-align: center;">
                    This action will delete the ffprobe binary and download the latest version. Are you sure you want to proceed?
                </p>
                <Button @click="reloadFfprobe" style="width: 100%; margin-top: 1em;" label="Confirm" severity="danger" outlined />
            </div>
        </Dialog>
        <!-- <Button :disabled="!changes" :severity="changes ? 'primary' : 'secondary'"  style="position: absolute;  bottom: 10px; right: 20px;" @click="saveConfig"  label="Save changes"  /> -->
        <!-- <div class="config-options">
            <span>
                Enable system notification:
            </span>
            <ToggleSwitch v-model="newUserConfig.enableSystemNotification" />
        </div>
        <div class="config-options">
            <span>
                Keep yt-dlp up to date:
            </span>
            <ToggleSwitch v-if="newUserConfig.keepUpToDate" v-model="newUserConfig.keepUpToDate.ytDlp" />
        </div>
        <div class="config-options">
            <span>
                Keep ffmpeg up to date:
            </span>
            <ToggleSwitch v-if="newUserConfig.keepUpToDate" v-model="newUserConfig.keepUpToDate.ffmpeg" />
        </div> -->
        <div class="config-options">
            <span>
                Clear all recent downloads:
            </span>
            <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center; flex-direction: column;">    
                <Button @click="clearRecentDownloadsVisible=true"  label="Clear" severity="danger" outlined  />
            </div>
        </div>
        <div class="config-options">
            <span>
                Clear all user config:
            </span>
            <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center; flex-direction: column;">    
                <Button @click="clearUserConfigVisible=true"  label="Clear" severity="danger" outlined />
            </div>
        </div>
        <div class="config-options">
            <span>
                Reload yt-dlp:
            </span>
            <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center; flex-direction: column;">    
                <Button @click="reloadYtdlpVisible=true"  label="Reload" severity="danger" outlined />
            </div>
        </div>
        <div class="config-options">
            <span>
                Reload ffmpeg:
            </span>
            <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center; flex-direction: column;">    
                <Button @click="reloadFfmpegVisible=true"  label="Reload" severity="danger" outlined />
            </div>
        </div>
        <div class="config-options">
            <span>
                Reload ffprobe:
            </span>
            <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center; flex-direction: column;">    
                <Button @click="reloadFfprobeVisible=true"  label="Reload" severity="danger" outlined />
            </div>
        </div>
    </div>

</template>
<script lang="ts">
import Button from 'primevue/button';
import { useFSStore } from '../../stores/fileSystem';
import { changeConfig, deleteConfig, getEmptyUserConfig } from '../../helpers/userConfig';
import ytdlpVariables from '../../constants/ytdlpVariables';
import AutoComplete from 'primevue/autocomplete';
import BaseFileInput from '../BaseFileInput.vue';
import { useUserConfig } from '../../stores/userConfig';
import FloatLabel from 'primevue/floatlabel';
import { audioExtensions, videoExtensions } from '../../constants/fileExtensions';
import ToggleSwitch from 'primevue/toggleswitch';
import Dialog from 'primevue/dialog';
import { clearHist } from '../../helpers/history';
import { downloadBinaryFfmpeg, downloadBinaryFfprobe, downloadBinaryYtdlp } from '../../helpers/externalPrograms';

    export default {
        name: "TheHeader",
        components: {
            BaseFileInput,
            Button,
            AutoComplete,
            FloatLabel,
            ToggleSwitch,
            Dialog
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
                clearRecentDownloadsVisible: false,
                clearUserConfigVisible: false,                
                reloadYtdlpVisible: false,    
                reloadFfmpegVisible: false,
                reloadFfprobeVisible: false,            

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
                    console.log(this.userConfig);
                    console.log(this.newUserConfig)
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
            deleteRecentDownloads() {
                this.clearRecentDownloadsVisible=false;
                clearHist();
            },  
            deleteUserConfig() {
                this.clearUserConfigVisible=false;
                deleteConfig();
            },  
            reloadYtdlp() {
                this.reloadYtdlpVisible=false;
                downloadBinaryYtdlp();
            }, 
            reloadFfmpeg() {
                this.reloadFfmpegVisible=false;
                downloadBinaryFfmpeg();
            }, 
            reloadFfprobe() {
                this.reloadFfprobeVisible=false;
                downloadBinaryFfprobe();
            }, 
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


</style>