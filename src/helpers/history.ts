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
    info('Starting create hist file')
    const data = '[]'
    await writeTextFile('download-history.json',data,{baseDir: BaseDirectory.AppLocalData}).then(()=>{
        info('Done')
    }).catch((err)=>{
        info('ERROR'+err)
    }).finally(()=>{
        info('Ending create hist file')
    });
}

export async function readHistFile(): Promise<DownloadLog[] | null> {
    info('Starting read hist file')
    return readTextFile('download-history.json',{baseDir: BaseDirectory.AppLocalData}).then((content)=>{
        const data:DownloadLog[] = JSON.parse(content);

        info(content);
        return data.reverse()
    }).catch(()=>{
        return null
    }).finally(()=>{
        info('Ending read hist file')
    })
}