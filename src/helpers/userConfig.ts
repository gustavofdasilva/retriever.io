import { Store } from '@tauri-apps/plugin-store'

export async function initConfigFile(): Promise<boolean> { //Return true if already exists, if not return false
    const userConfig = await readConfigFile();

    if(userConfig == null) {
        console.log("Criando arquivo")
        await createConfigFile({
            defaultOutput: '',
            defaultFileName: '%(title)s',
            defaultAudioFormat: '.mp3',
            defaultVideoFormat: '.mp4',
            authentication: {
                enabled: false,
                cookiesFromBrowser: '',
                cookiesTxtFilePath: '',
            }
        });
        return false
    }

    return true;
}

export async function deleteConfig() {
    const store = await Store.load('user-config.json');
    console.log('reset');
    await store.reset();
}

export async function changeConfig<K extends keyof UserConfig>(config: K, value: UserConfig[K]) {
    const store = await Store.load('user-config.json');
    const data = await store.get<UserConfig>('user-config');
    let newData = data ?? {} as UserConfig;

    newData[config] = value;

    await store.set('user-config',newData);
}

export async function clearConfig() {
    const store = await Store.load('user-config.json');

    store.clear();
}

export async function createConfigFile(predefinedData?: UserConfig) {
    const store = await Store.load('user-config.json', {
        createNew: true,
    })
    const data = predefinedData ?? <UserConfig>{}

    store.set('user-config',data);
}

export async function readConfigFile(): Promise<UserConfig | null> {
    
    const store = await Store.load('user-config.json')

    const data = await store.get<UserConfig>('user-config');

    return data ?? null;
}