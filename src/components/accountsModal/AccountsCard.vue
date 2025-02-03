<template>
    <Dialog class="crud-account-modal" v-model:visible="showCrudModal" :draggable="false" modal header="Edit account">
        <div class="crud-content">
            <div class="option">
                <label for="label">Label:</label>
                <input  type="text" name="label" id="label" v-model="newAccount.label">
            </div>
            <div class="option">
                <label for="website">Website:</label>
                <input  type="text" name="website" id="website" v-model="newAccount.website">
            </div>
            <div class="option">
                <label for="username">Username:</label>
                <input  type="text" name="username" id="username" v-model="newAccount.username">
            </div>
            <div class="option">
                <label for="password">Password:</label>
                <input type="password" name="password" id="password" v-model="newAccount.password">
            </div>
            <div style="display: flex; align-items: center;">
                <Button :disabled="!changes" style="margin-top: 1.5em; flex: 8; margin-right: .5em;" :severity="changes ? 'primary' : 'secondary'"  @click="saveAccount"  label="Save changes"  />
                <Button style="margin-top: 1.5em; flex: 1;" severity="secondary"  @click="toggle" icon="pi pi-trash"  />
                <Menu ref="menu" id="overlay_menu" :model="deleteConfirm" :popup="true" />
            </div>
        </div>
    </Dialog>
    <div class="accounts-card-container">
        <div class="main-account-content">
            <div class="accounts-card-content">
                <p style="font-weight: bold;">
                    {{label}}
                </p>
                <p style="color: var(--surface-600);">
                    {{website}}
                </p>
            </div>
            <div class="accounts-card-edit">
                <Button severity="secondary" variant="text" type="button" :icon="!showHiddenInfo ? 'pi pi-eye' : 'pi pi-eye-slash'" @click="toggleHiddenInfo"  />
                <Button severity="secondary" variant="text" type="button" icon="pi pi-pencil" @click="toggleCrud"  />
            </div>
        </div>
        <div v-if="showHiddenInfo" class="hidden-information">
            <p>Username: {{username}}</p>
            <p>Password: {{password}}</p>
        </div>
    </div>
</template>
<script lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import FloatLabel from 'primevue/floatlabel';
import Menu from 'primevue/menu';
import { useUserConfig } from '../../stores/userConfig';

export default {
    components: {
        Button,
        Dialog,
        FloatLabel,
        Menu
    },
    props: {
        label: String,
        website: String,
        username: String,
        password: String
    },
    setup() {
        const userConfig = useUserConfig();

        return {
            userConfig
        }
    },
    data() {
        return {
            showCrudModal: false,
            showHiddenInfo: false,
            newAccount: {} as Account,
            account: {} as Account,
            changes: true,
            deleteConfirm: [{ 
                label: 'Delete Account?',
                command: ()=>{
                    this.deleteAccount()
                },
                class: 'alert'
            }],
        }
    },
    watch: {
        newAccount: {
            handler: function(val) {
                console.log(val)
                this.changes = this.compareUserConfigs(this.account, val);
            },
            deep: true
        }
    },
    mounted() {
        this.account = {
            label: this.label ?? "",
            website: this.website ?? "",
            username: this.username ?? "",
            password: this.password ?? ""
        }

        this.newAccount = {...this.account}
    },
    methods: {
        deleteAccount() {
            console.log("DELETE")
            const accounts = this.userConfig.getUserConfig.accounts
            this.userConfig.setUserConfigField('accounts',accounts?.filter(account=>{
                console.log(account.label!=this.account.label)
                return account.label!=this.account.label
            }))
            this.showCrudModal = false;
        },
        saveAccount() {
            if(this.changes) {
                const accounts = this.userConfig.getUserConfig.accounts
                this.userConfig.setUserConfigField('accounts',accounts?.map(account=>{
                    console.log(account)
                    if(account.label==this.account.label) {
                        return {
                            label: this.newAccount.label,
                            website: this.newAccount.website,
                            username: this.newAccount.username,
                            password: this.newAccount.password
                        }
                    } else {
                        return account   
                    }
                }))
                this.showCrudModal = false;
            }
        },
        toggle(event: any) {
            //@ts-ignore
            this.$refs.menu.toggle(event);
        },
        compareUserConfigs(obj1: Account, obj2:Account) {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            if (keys1.length !== keys2.length) {
                return true; 
            }

            for (let key of keys1) {
                if (!keys2.includes(key) || obj1[key as keyof Account] != obj2[key as keyof Account]) {
                    console.log(key);
                    return true; 
                }
            }

            return false;
        },
        toggleCrud() {
            this.showCrudModal = !this.showCrudModal;
        },
        toggleHiddenInfo() {
            this.showHiddenInfo = !this.showHiddenInfo
        }
    }
}
</script>
<style scoped>

    .crud-content {
        width: 100%;
        height: 100%;
        position: relative;
        margin-left: 1em;
    }

    .crud-content > .option {
        display: flex;
        align-items: center;
        margin: 1.5em 0 0 0;
        justify-content: space-between;
        
    }
        .crud-content > .option label{
            margin-right: 1em;
        }


     .accounts-card-container {
        justify-self: center;
        width: 100%;
        background-color: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        padding: 0.5em .8em;
        margin: 0.5em 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .main-account-content {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
    }

    .hidden-information {
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-content: center;
        margin-top: 1em;
        padding: 1em 0 .5em 0;
        border-top: 1px solid var(--surface-800);
        font-size: .95em;
        color: var(--surface-300);
    }

    .accounts-card-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .accounts-card-edit {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    a:hover {
        color: unset;
    }

    p {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    input {
        background: var(--black-background-900);
        border: 1px solid var(--black-background-800);
        border-radius: var(--p-form-field-border-radius);
        padding: .4em .9em;
        outline: none;
        transition: all ease .2s;
        width: 80%;
    }
        
        input:focus, input:hover {
            border-color: var(--black-background-700);
            transition: all ease .2s;
        }
</style>