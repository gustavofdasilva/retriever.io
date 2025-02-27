import { invoke } from '@tauri-apps/api/core';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { platform, version } from '@tauri-apps/plugin-os';


const currentPlatform = platform();
const currentVersion = version();

async function getRemoteVersionYtdlp(): Promise<string | null> {
    const version = await invoke('get_remote_version_ytdlp');

    if(typeof version === 'string') { 
        return version
    }
    return null;
}

async function getBinaryUrlYtdlp(): Promise<string | null> {
    const binaryUrl = await invoke('get_binary_url_ytdlp', {
        platform: currentPlatform,
        version: currentVersion
    })

    console.log(binaryUrl)
    if(typeof binaryUrl === 'string') { 
        return binaryUrl;
    }
    return null;
}

export async function downloadBinaryYtdlp(): Promise<void> {
    const binaryUrl = await getBinaryUrlYtdlp();
    const version = await getRemoteVersionYtdlp();
    const path = await appLocalDataDir();

    invoke('download_ytdlp', {
        binaryUrl: binaryUrl,
        version: version,
        path: path
    })
}