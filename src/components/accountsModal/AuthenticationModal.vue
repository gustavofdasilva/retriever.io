<template>
    <div class="config-content">
        <div class="cookies-container">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; flex-direction: column; margin: 1em 0 0 1em">
                    <p >Enable authentication:</p><aside style="color: var(--surface-700);">Include authentication in command</aside>
                </div>
                <div style="margin-right: 5em;">
                    <ToggleSwitch v-model="enableAuth" @change="toggleEnableAuth"/>
                </div>
            </div>
        </div>
        <span v-if="userConfigStore.getUserConfig.authentication.enabled"  style="font-size: 1.2em; font-weight: bold;">Cookies</span>
        
        <div v-if="userConfigStore.getUserConfig.authentication.enabled" class="cookies-container">
            <div style="display: flex; align-items: center; justify-content: space-between; margin: 1em 0 0 1em">
                <div style="display: flex; flex-direction: column;">
                    <p >Use cookies from browser:</p><aside style="color: var(--surface-700);">Recommended</aside>
                </div>
                <div style="margin-left: 1em;">
                    <FloatLabel variant="on">
                        <label style="z-index: 1;" for="browser_dropdown">Browser</label>
                        <AutoComplete fluid inputId="browser_dropdown" v-model="browser" dropdown :suggestions="filteredBrowsers" @complete="searchBrowser" @change="setBrowser" />
                    </FloatLabel>
                </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin: 2em 0 0 1em">
                <div style="display: flex; flex-direction: column; justify-content: center; flex: 1;">
                    <p >Use cookies from .txt file:</p>
                </div>
                <div style="margin-left: 1em; max-width: 80%;">
                    <BaseFileInput 
                        style="font-size: 0.93em;"
                        :directory="false"
                        :path="userConfigStore.getUserConfig.authentication?.cookiesTxtFilePath"
                        @folder-selected="setCoookiesTxtFile"/>
                </div>
            </div>
        </div>
        <span  v-if="userConfigStore.getUserConfig.authentication.enabled"  style="font-size: 1.1em; font-weight: bold;">Account</span>
        <div  v-if="userConfigStore.getUserConfig.authentication.enabled"  class="account-container">
            <p style="color: var(--surface-400);">Create Accounts to use a login in a website. If a website requires the user to login, you can specify the website, username and password by registering this account here.</p>
            <p style="color: var(--surface-400); font-size: .8em;">* If a url is not downloading while passing username and password, delete the account associated and proceed with cookies. This is probably a yt-dlp issue</p>
            <AccountsContainer/>
        </div>
    </div>
</template>
<script lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tabs from 'primevue/tabs';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import AutoComplete, { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import FloatLabel from 'primevue/floatlabel';
import ToggleSwitch from 'primevue/toggleswitch';
import ytdlpVariables from '../../constants/ytdlpVariables';
import { useUserConfig } from '../../stores/userConfig';
import { findConfigCode, findConfigName } from '../../helpers/download';
import { browser } from '../../constants/browser';
import { filterArray } from '../../helpers/miscFuncs';
import BaseButton from '../BaseButton.vue';
import BaseFileInput from '../BaseFileInput.vue';
import BaseIconButton from '../BaseIconButton.vue';
import AccountsContainer from './AccountsContainer.vue';

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
            AccountsContainer,
            FloatLabel,
            ToggleSwitch
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
            const userConfigStore = useUserConfig();

            return {
                userConfigStore
            }
        },
        mounted() {
            try {
                this.enableAuth = this.userConfigStore.getUserConfig.authentication.enabled;
                this.browser = findConfigName(this.userConfigStore.getUserConfig.authentication.cookiesFromBrowser,browser);
                if(this.browser != '') {
                    let auth = this.userConfigStore.getUserConfig.authentication ?? {} as UserAuthentication;

                    auth.cookiesTxtFilePath = '';

                    this.userConfigStore.setUserConfigField('authentication',auth);
                }
            } catch (error) {console.log(error)}
        },
        methods: {
            async setBrowser() {
                let auth = this.userConfigStore.getUserConfig.authentication ?? {} as UserAuthentication;

                auth.cookiesFromBrowser = findConfigCode(this.browser,browser) ;
                auth.cookiesTxtFilePath = '';

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
            async setCoookiesTxtFile(path: string)  {
                let auth = this.userConfigStore.getUserConfig.authentication ?? {} as UserAuthentication;

                auth.cookiesTxtFilePath = path;
                auth.cookiesFromBrowser = '';
                this.browser = '';

                await this.userConfigStore.setUserConfigField('authentication',auth);
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