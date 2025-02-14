<template>
    <Dialog class="crud-account-modal" v-model:visible="showCrudModal" :draggable="false" modal header="Create account" @hide="()=>{newAccount={} as Account}">
        <div class="crud-content">
            <div class="option">
                <label for="label">Label:</label>
                <input type="text" name="label" id="label" v-model="newAccount.label">
            </div>
            <div class="option">
                <label for="website">Website:</label>
                <input v-tooltip="'Website name/domain to match with the URL selected'"  type="text" name="website" id="website" v-model="newAccount.website">
            </div>
            <div class="option">
                <label for="username">Username:</label>
                <input v-tooltip="'--username'" type="text" name="username" id="username" v-model="newAccount.username">
            </div>
            <div class="option">
                <label for="password">Password:</label>
                <input v-tooltip="'--password'" type="password" name="password" id="password" v-model="newAccount.password">
            </div>
            <Button :disabled="!checkEmptyField()" style="margin-top: 1.5em; " fluid :severity="checkEmptyField() ? 'primary' : 'secondary'"  @click="createAccount"  label="Create account"  />
        </div>
    </Dialog>
    <div class="accounts-container">
        <ScrollPanel class="cards">
            <AccountsCard v-for="account in userConfig.getUserConfig.accounts" 
               :label="account.label" 
               :website="account.website" 
               :username="account.username" 
               :password="account.password" />
        </ScrollPanel>
        <Button icon="pi pi-plus" @click="toggleCrud" label="Create new account" variant="text" severity="secondary" />
    </div>
</template>
<script lang="ts">
import Button from 'primevue/button';
import AccountsCard from './AccountsCard.vue';
import ScrollPanel from 'primevue/scrollpanel';
import { useUserConfig } from '../../stores/userConfig';
import Dialog from 'primevue/dialog';

export default {
    components: {
        AccountsCard,
        Button,
        ScrollPanel,
        Dialog
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
            labelAlreadyExists: false,
        }
    },
    methods: {
        newNotification(summary: string, message:string,life:number) {
            this.$toast.add({
                severity: 'secondary',
                summary: summary,
                detail: message,
                life: life,
                closable: true
            })
        },
        async createAccount() {
            if(this.userConfig.getUserConfig.accounts?.find(account=>{
              return account.label === this.newAccount.label
            })) {
                this.labelAlreadyExists = true;
                this.newNotification('Alert','This label is already in use',3000);
                return
            }

            this.labelAlreadyExists = false;
            const accounts = this.userConfig.userConfig.accounts ?? []
            accounts.push({
                label: this.newAccount.label,
                website: this.newAccount.website,
                username: this.newAccount.username,
                password: this.newAccount.password,
            })
            
            this.userConfig.setUserConfigField('accounts',accounts);

            this.newAccount = {} as Account;
            this.showCrudModal = false;
        },
        checkEmptyField() {
            if(this.newAccount.label == "" ||
            this.newAccount.website == "" ||
            this.newAccount.username == "" ||
            this.newAccount.password == "" ||
            !this.newAccount.label ||
            !this.newAccount.website||
            !this.newAccount.username||
            !this.newAccount.password) {
                return false
            }

            return true
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

    .accounts-container {
        padding-top: 1em;
        width: 100%;
        max-height: 85%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    .cards {
        width: 100%;
        height: 80%;
        overflow-y: auto;
        overflow-x: hidden;
    }
    
</style>