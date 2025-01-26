import { BaseDirectory, open, readFile, readTextFile, writeFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";

export async function addToHist(newDownload: DownloadLog) {
    const downloadsArr = await readHistFile();
    let newDownloadsArr: Object[];

    if(downloadsArr == null) {
        await createHistFile();
        addToHist(newDownload);
        return 
    }

    newDownloadsArr = downloadsArr;
    newDownloadsArr.push(newDownload);

    const file = await open('download-history.json',{
        write: true,
        baseDir: BaseDirectory.AppLocalData
    })

    await file.write(new TextEncoder().encode(JSON.stringify(newDownloadsArr)));
    await file.close();
}

export async function clearHist() {
    const downloadsArr = await readHistFile();

    if(downloadsArr == null) {
        await createHistFile();
        return 
    }

    const file = await open('download-history.json',{
        write: true,
        truncate: true,
        baseDir: BaseDirectory.AppLocalData
    })

    await file.write(new TextEncoder().encode('[]'));
    await file.close();
}

export async function createHistFile() {
    const data = '[]'
    await writeTextFile('download-history.json',data,{baseDir: BaseDirectory.AppLocalData}).catch((err)=>{
        info('ERROR'+err)
    })
}

export async function readHistFile(): Promise<DownloadLog[] | null> {
    return readTextFile('download-history.json',{baseDir: BaseDirectory.AppLocalData}).then((content)=>{
        let data:DownloadLog[] = JSON.parse(content);

        data.sort((a,b)=>{
            const dateA = new Date(a.dateCreated).getTime();
            const dateB = new Date(b.dateCreated).getTime();
            return dateA < dateB ? 1: -1;
        })

        return data
    }).catch(()=>{
        return null
    })
}