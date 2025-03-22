import { invoke } from '@tauri-apps/api/core';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { platform, version, arch } from '@tauri-apps/plugin-os';
import toasteventbus from 'primevue/toasteventbus';


const currentPlatform = platform();
const currentVersion = version();

async function getMainPath(): Promise<string> {
    const path = await appLocalDataDir();
    return path;
}

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

async function getFFinfo(): Promise<{
        version: string,
        ffmpeg_url: string,
        ffprobe_url: string
    } | null> {

    const ffInfo: {
        version: string,
        ffmpeg_url: string,
        ffprobe_url: string
    } = await invoke('get_binary_info_ff', {
        platform: currentPlatform,
    })

    return ffInfo;
}

async function checkBinaryVersion(binaryUrl: string, version: string, path: string): Promise<boolean> {
    const response: string = await invoke('check_version_binary', {
        binaryUrl: binaryUrl,
        version: version,
        path: path
    })

    return response.includes("DOWNLOAD")
}

export async function downloadBinaryYtdlp(): Promise<void> {
    const binaryUrl = await getBinaryUrlYtdlp()??'';
    const version = await getRemoteVersionYtdlp()??'';
    const path = (await getYtDlpPath()??"").split("/binaries")[0];

    const download = await checkBinaryVersion(binaryUrl,version,path);

    if(!download) {
        return
    }

    invoke('download_binary', {
        binaryUrl: binaryUrl,
        version: version,
        path: path
    }).then((res)=>{
        toasteventbus.emit('add',{ 
            severity: 'secondary', 
            summary: 'Download binaries', 
            detail: res,
            life: 3000,
            closable: true
        })
    })
}

export async function downloadBinaryFfmpeg(): Promise<void> {
    const binaryInfo = await getFFinfo();
    const path = await getMainPath();

    const download = await checkBinaryVersion(binaryInfo?.ffmpeg_url??'',binaryInfo?.version??'',path);

    if(!download) {
        return
    }

    invoke('download_binary', {
        binaryUrl: binaryInfo?.ffmpeg_url,
        version: binaryInfo?.version,
        path: path
    }).then((res)=>{
        toasteventbus.emit('add',{ 
            severity: 'secondary', 
            summary: 'Download binaries', 
            detail: res,
            life: 3000,
            closable: true
        })
    })
}

export async function downloadBinaryFfprobe(): Promise<void> {
    const binaryInfo = await getFFinfo();
    const path = await getMainPath();

    const download = await checkBinaryVersion(binaryInfo?.ffprobe_url??'',binaryInfo?.version??'',path);

    if(!download) {
        return
    }

    invoke('download_binary', {
        binaryUrl: binaryInfo?.ffprobe_url,
        version: binaryInfo?.version,
        path: path
    }).then((res)=>{
        toasteventbus.emit('add',{ 
            severity: 'secondary', 
            summary: 'Download binaries', 
            detail: res,
            life: 3000,
            closable: true
        })
    })
}


export async function getYtDlpPath():Promise<String> {
    const path = await getMainPath();
    const url = await getBinaryUrlYtdlp()??'';
    const name = url.split('/').pop();

    return `${path}/binaries/${name}`;
}

export async function getYtdlpLocaleVersion(): Promise<string> {
    let ytdlpVersion = '';
    const path = await getMainPath();
    const jsonString: string = await invoke('get_json_locale_version',{
        path
    });

    const versionObj: any = JSON.parse(jsonString);
    for (const param in versionObj) {
        if(param.includes('yt-dlp')) {
            ytdlpVersion = versionObj[param];       
        }
    }

    return ytdlpVersion;
}

export async function getFFLocaleVersion(): Promise<string> {
    let ffVersion = '';
    const path = await getMainPath();
    const jsonString: string = await invoke('get_json_locale_version',{
        path
    });

    const versionObj: any = JSON.parse(jsonString);
    for (const param in versionObj) {
        if(param.includes('ffmpeg')) {
            ffVersion = versionObj[param];       
        }
    }

    return ffVersion;
}
