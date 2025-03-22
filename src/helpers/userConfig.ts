import { Store } from '@tauri-apps/plugin-store'
import { exit } from '@tauri-apps/plugin-process';

export function getEmptyUserConfig(): UserConfig {
    return {
        defaultOutput: '',
        defaultFileName: '%(title)s',
        defaultAudioFormat: '.mp3',
        defaultVideoFormat: '.mp4',
        authentication: {
            enabled: false,
            cookiesFromBrowser: '',
            cookiesTxtFilePath: '',
        },
        keepUpToDate: {
            ytDlp: true,
            ffmpeg: true,
        },
        downloads: {
            concurrentDownloads: 1,
            disablePartFiles: false,
            downloadRateLimit: null,
            fileAccessRetries: null,
            numberOfRetries: null,
            restrictFilename: false,
            trimFilename: null
        },
        enableSystemNotification: false,
        metadata: {
            downloadDescriptionInFileDefault: false,
            downloadSubtitlesInFile: {
                enabled: false,
                lang: [],
                type: 'Normal'
            },
            downloadThumbnailByDefault: null,
        },
        postProcessing: {
            embedChaptersInVideo: false,
            embedSubtitles: {
                enabled: false,
                lang: []
            },
            embedThumbnailCoverArt: false,
        },
        interface: {
            showDownloadProgressNotification: 'Summarized',
            notificationPosition: 'bottom-right'
        },
        customBinaries: {
            ytDlp: {
                enabled: false,
                path: '',
            },
            ffmpeg: {
                enabled: false,
                path: '',
            },
        }
    }
}

export async function initConfigFile(): Promise<boolean> { //Return true if already exists, if not return false
    const userConfig = await readConfigFile();

    if(userConfig == null) {
        console.log("Criando arquivo")
        await createConfigFile(getEmptyUserConfig());
        return false
    }

    return true;
}

export async function deleteConfig() {
    const store = await Store.load('user-config.json');
    await store.reset();
    exit(); //REFACTOR: relaunch() instead of exit()
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