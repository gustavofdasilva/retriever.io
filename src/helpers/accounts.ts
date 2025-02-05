import { useUserConfig } from "../stores/userConfig"

export const findAccount = (url: string): Account | null => {
    const accounts = useUserConfig().getUserConfig.accounts;
    
    return accounts?.find((account)=>{
        return url.includes(account.website);
    }) ?? null;

}