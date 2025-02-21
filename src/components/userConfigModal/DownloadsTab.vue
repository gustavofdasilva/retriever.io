<template>
    <div style="width: 100%; ">
        <Button :disabled="!changes" :severity="changes ? 'primary' : 'secondary'"  style="position: absolute; bottom: 10px; right: 20px;" @click="saveConfig"  label="Save changes"  />
        <div class="config-options">
            <span>
                Default download folder:
            </span>

            <div style="flex: 1;">
                <BaseFileInput
                style="font-size: 0.93em; width: 100%;"
                :path="newUserConfig.defaultOutput"
                @folder-selected="setDefaultFolderUserConfig"/>
                <Message style="margin-left: 1em;" v-if="missingInfo && newUserConfig.defaultOutput == ''" severity="error" size="small" variant="simple">The file name needs to contain variables to prevent files with same name</Message>
            </div>
        </div>
        <div class="config-options">
            <span style="margin-bottom: .5em;">
                Default output file name:
            </span>
            <div style="flex: 1;">
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
                <Message style="margin-left: 1em;" v-if="(missingInfo && newUserConfig.defaultFileName == '')" severity="error" size="small" variant="simple">The file name cannot be empty</Message>
                <Message style="margin-left: 1em;" v-if="(!newUserConfig.defaultFileName.match(/%\([^)]+\)/g) && newUserConfig.defaultFileName != '')" severity="error" size="small" variant="simple">The file name needs to contain variables to prevent files with same name</Message>
            </div>
        </div>
        <div class="config-options">
            <span>Default audio file extension:</span>
            <div style="width: 100%;">
                <AutoComplete :forceSelection="true"  fluid inputId="quality_dropdown" v-model="newUserConfig.defaultAudioFormat" dropdown :suggestions="filteredAudioExtensions" @complete="searchAudioExt" />
                <Message style="margin-left: 1em;" v-if="(missingInfo && newUserConfig.defaultAudioFormat == null)" severity="error" size="small" variant="simple">Select a default format</Message>
            </div>
        </div>
        <div class="config-options">
            <span>Default video file extension:</span>
            <div style="width: 100%;">
                <AutoComplete :forceSelection="true" fluid inputId="quality_dropdown" v-model="newUserConfig.defaultVideoFormat" dropdown :suggestions="filteredVideoExtensions" @complete="searchVideoExt" />
                <Message style="margin-left: 1em;" v-if="(missingInfo && newUserConfig.defaultVideoFormat == null)" severity="error" size="small" variant="simple">Select a default format</Message>
            </div>
        </div>
        <div class="config-options">
            <span class="name-w-label">
                <p>
                    Restrict filename:
                </p>
                <p>
                    Restrict filename to only ASCII characters
                </p>
            </span>
            <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end;">
                <ToggleSwitch v-if="newUserConfig.downloads" v-model="newUserConfig.downloads.restrictFilename" />
            </div>
        </div>
        <div class="config-options">
            <span class="name-w-label">
                <p>
                    Trim filename:
                </p>
                <p>
                    Set filenames max length (0 = disabled)
                </p>
            </span>
            <div style="flex: 1; display: flex; align-items: end; justify-content: center; flex-direction: column;">
                <input v-if="newUserConfig.downloads" min="0" max="100" type="number" name="trimFilename" id="trimFilename" v-model="newUserConfig.downloads.trimFilename" @change="(event)=>{
                    //@ts-ignore
                    if(event.target.value > 100) {
                        newUserConfig.downloads.trimFilename = 100;
                        //@ts-ignore
                    } else if (event.target.value < 0) {
                        newUserConfig.downloads.trimFilename = 0;
                    }
                }">
                
                <Message style="margin-left: 1em;" v-if="(
                    //@ts-ignore
                    missingInfo && (newUserConfig.downloads.trimFilename == null || newUserConfig.downloads.trimFilename == '' || newUserConfig.downloads.trimFilename < 0)
                )" severity="error" size="small" variant="simple">Select a valid value</Message>
            </div>
        </div>
        <div class="config-options">
            <span class="name-w-label">
                <p>
                    Disable PART files:
                </p>
                <p>
                    Stop yt-dlp of using .PART files
                </p>
            </span>
            <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end;">
                <ToggleSwitch v-if="newUserConfig.downloads" v-model="newUserConfig.downloads.disablePartFiles" />
            </div>
        </div>
        <div class="config-options">
            <span class="name-w-label">
                <p>
                    Concurrent downloads:
                </p>
                <p>
                    How many downloads can be done at the same time
                </p>
            </span>
            <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center; flex-direction: column;">
                <input v-if="newUserConfig.downloads" min="0" max="20" type="number" name="concurrentDownloads" id="concurrentDownloads" v-model="newUserConfig.downloads.concurrentDownloads" @change="(event)=>{
                    //@ts-ignore
                    if(event.target.value > 20) {
                        newUserConfig.downloads.concurrentDownloads = 20;
                        //@ts-ignore
                    } else if(event.target.value <0) {
                        newUserConfig.downloads.concurrentDownloads = 0;
                    }
                }">
                <Message style="margin-left: 1em;" v-if="(
                    //@ts-ignore
                    missingInfo && (newUserConfig.downloads.concurrentDownloads == null || newUserConfig.downloads.concurrentDownloads == '' || newUserConfig.downloads.concurrentDownloads < 0)
                )" severity="error" size="small" variant="simple">Select a valid value</Message>
            </div>
        </div>
        <div class="config-options">
            <span class="name-w-label">
                <p>
                    Rate limit:
                </p>
                <p>
                    Minimum download rate in bytes per second (Example: 30k or 30m).<br> Empty = disabled
                </p>
            </span>
            <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end;">
                <!-- <input v-if="newUserConfig.downloads" type="text" name="downloadRateLimit" id="downloadRateLimit" v-model="newUserConfig.downloads.downloadRateLimit"> -->
                <AutoComplete v-if="newUserConfig.downloads" forceSelection style="width: 7em;" type="text" name="downloadRateLimit" id="downloadRateLimit" v-model="newUserConfig.downloads.downloadRateLimit" :suggestions="rateLimitSuggestions" @complete="searchRateLimit" />
            </div>
        </div>
        <div class="config-options">
            <span class="name-w-label">
                <p>
                    Number of retries:
                </p>
                <p>
                    How many times to retry when failed
                </p>
            </span>
            <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center; flex-direction: column;">
                <input v-if="newUserConfig.downloads" min="0" max="10" type="number" name="retries" id="retries" v-model="newUserConfig.downloads.numberOfRetries" @change="(event)=>{
                    //@ts-ignore
                    if(event.target.value > 10) {
                        newUserConfig.downloads.numberOfRetries = 10;
                        //@ts-ignore
                    } else if (event.target.value < 0) {
                        newUserConfig.downloads.numberOfRetries = 0;
                    }
                }">
                
                <Message style="margin-left: 1em;" v-if="(
                    //@ts-ignore
                    missingInfo && (newUserConfig.downloads.numberOfRetries == null || String(newUserConfig.downloads.numberOfRetries) == '' || newUserConfig.downloads.numberOfRetries < 0)
                )" severity="error" size="small" variant="simple">Select a valid value</Message>
            </div>
        </div>
        <div class="config-options">
            <span class="name-w-label">
                <p>
                    File access retries:
                </p>
                <p>
                    How many times to retry when failed to access file
                </p>
            </span>
            <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center; flex-direction: column;">
                <input v-if="newUserConfig.downloads" min="0" max="10" type="number" name="retries" id="retries" v-model="newUserConfig.downloads.fileAccessRetries" @change="(event)=>{
                    //@ts-ignore
                    if(event.target.value > 10) {
                        newUserConfig.downloads.fileAccessRetries = 10;
                    //@ts-ignore
                    } else if(event.target.value < 0) {
                        newUserConfig.downloads.fileAccessRetries = 0;
                    }
                }">
                
                <Message style="margin-left: 1em;" v-if="(
                    //@ts-ignore
                    missingInfo && (newUserConfig.downloads.fileAccessRetries == null || String(newUserConfig.downloads.fileAccessRetries) == '' || newUserConfig.downloads.fileAccessRetries < 0)
                )" severity="error" size="small" variant="simple">Select a valid value</Message>
            </div>
        </div>
        
    </div>

</template>
<script lang="ts">
import Button from 'primevue/button';
import { useFSStore } from '../../stores/fileSystem';
import { changeConfig, getEmptyUserConfig } from '../../helpers/userConfig';
import ytdlpVariables from '../../constants/ytdlpVariables';
import AutoComplete from 'primevue/autocomplete';
import BaseFileInput from '../BaseFileInput.vue';
import { useUserConfig } from '../../stores/userConfig';
import FloatLabel from 'primevue/floatlabel';
import { audioExtensions, videoExtensions } from '../../constants/fileExtensions';
import ToggleSwitch from 'primevue/toggleswitch';
import Message from 'primevue/message';

    export default {
        name: "TheHeader",
        components: {
            BaseFileInput,
            Button,
            AutoComplete,
            FloatLabel,
            ToggleSwitch,
            Message
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
                missingInfo: false,
                rateLimitSuggestions: [] as string[],
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
            checkInputsCompleted():boolean {
                if(this.newUserConfig.defaultOutput == '' ||
                this.newUserConfig.defaultFileName == '' ||
                this.newUserConfig.defaultAudioFormat == null ||
                this.newUserConfig.defaultVideoFormat == null ||
                //@ts-ignore
                (this.newUserConfig.downloads.trimFilename == null || this.newUserConfig.downloads.trimFilename < 0)||
                //@ts)-ignore
                (this.newUserConfig.downloads.concurrentDownloads==null || String(this.newUserConfig.downloads.concurrentDownloads)=='' || this.newUserConfig.downloads.concurrentDownloads < 0) ||
                //@ts-ignore
                (this.newUserConfig.downloads.numberOfRetries==null || String(this.newUserConfig.downloads.numberOfRetries)=='' || this.newUserConfig.downloads.numberOfRetries < 0) ||
                //@ts-ignore
                (this.newUserConfig.downloads.fileAccessRetries==null || String(this.newUserConfig.downloads.fileAccessRetries)=='' || this.newUserConfig.downloads.fileAccessRetries < 0) 
                ) {
                    console.log(this.newUserConfig)
                    return false
                }
                console.log(this.newUserConfig)
                return true
            },
            searchRateLimit(event:any) {
                if (!event.query.match(/^\d+$/g)) {
                    this.rateLimitSuggestions=[]
                    this.newUserConfig.downloads.downloadRateLimit = '';
                    return
                }

                this.rateLimitSuggestions = ['KB','MB'].map((item) => event.query + '' + item);
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
                if(this.checkInputsCompleted()) {
                    if(this.changes) {
                        this.userConfigStore.setUserConfig(this.newUserConfig);
                        this.$emit('setConfigModalVisible', false);
                    }
                    this.missingInfo = false;
                } else {
                    this.newNotification("Missing user information",3000);
                    this.missingInfo = true;
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
            newNotification(message: string, life: number) {
                this.$toast.add({
                    severity: 'secondary',
                    summary: 'Alert',
                    detail: message,
                    life: life,
                    closable: true
                })
            }
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