import { BaseDirectory, open, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";

export async function initConfigFile() {
    const userConfig = await readConfigFile();

    if(userConfig == null) {
        console.log("Criando arquivo")
        await createConfigFile({
            defaultOutput: '',
            defaultFileName: '%(title)s',
            defaultAudioFormat: '.mp3',
            defaultVideoFormat: '.mp4'
        });
    }
}

export async function changeConfig(config: string, value: string) {
    const userConfig = await readConfigFile();
    let newUserConfig;
    
    if(userConfig == null) {
        await createConfigFile();
        changeConfig(config,value);
        return 
    }

    newUserConfig = userConfig;
    newUserConfig[config as keyof UserConfig] = value;


    const file = await open('user-config.json',{
        write: true,
        baseDir: BaseDirectory.AppLocalData
    })

    await file.write(new TextEncoder().encode(JSON.stringify(newUserConfig)));
    await file.close();
}

export async function clearConfig() {
    const userConfig = await readConfigFile();

    if(userConfig == null) {
        await createConfigFile();
        return 
    }

    const file = await open('user-config.json',{
        write: true,
        truncate: true,
        baseDir: BaseDirectory.AppLocalData
    })

    const data = <UserConfig>{}

    await file.write(new TextEncoder().encode(JSON.stringify(data)));
    await file.close();
}

export async function createConfigFile(predefinedData?: UserConfig) {
    const data = predefinedData ?? <UserConfig>{}

    console.log("Arquivo criado")

    await writeTextFile('user-config.json',JSON.stringify(data),{baseDir: BaseDirectory.AppLocalData}).then(()=>{
        info('Done')
    }).catch((err)=>{
        info('ERROR'+err)
    })
}

export async function readConfigFile(): Promise<UserConfig | null> {
    return readTextFile('user-config.json',{baseDir: BaseDirectory.AppLocalData}).then((content)=>{
        let data:UserConfig = JSON.parse(content);

        return data
    }).catch(()=>{
        return null
    })
}