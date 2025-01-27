import { Store } from '@tauri-apps/plugin-store'

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
    const store = await Store.load('user-config.json');
    const data = await store.get<UserConfig>('user-config');
    let newData = data ?? {} as UserConfig;

    newData[config as keyof UserConfig] = value;

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