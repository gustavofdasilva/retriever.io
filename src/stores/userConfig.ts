import { defineStore } from "pinia";
import { changeConfig } from "../helpers/userConfig";

export const useUserConfig = defineStore("userConfig", {
    state: () =>({
        userConfig: {} as UserConfig
    }),
    getters: {
        getUserConfig: (state)=>(state.userConfig)
    },
    actions: {
        async setUserConfigField<K extends keyof UserConfig>(config: K, value: UserConfig[K]) {
            this.userConfig[config] = value;
            await changeConfig(config,value);
        },
        async setUserConfig(userConfig: UserConfig) {
            this.userConfig = userConfig;
            for(const [key,value] of Object.entries(userConfig)) {
                await changeConfig(key as keyof UserConfig, value)
            }
        }
    }
})