import { Store } from "@tauri-apps/plugin-store";

export async function addToHist(newDownload: DownloadLog) {
    const store = await Store.load('download-history.json');

    const data = await store.get<DownloadLog[]>('download-history');

    if(data == null) {
        await createHistFile();
        await addToHist(newDownload);
        return;
    }

    data.push(newDownload);

    await store.set('download-history',data);
}

export async function clearHist() {
    const store = await Store.load('download-history.json');
    store.clear();
}

export async function createHistFile() {
    const store = await Store.load('download-history.json',{
        createNew: true,   
    })
    
    store.set('download-history',[]);
}

export async function readHistFile(): Promise<DownloadLog[] | null> {
    const store = await Store.load('download-history.json')

    const data = await store.get<DownloadLog[]>('download-history');

    return data ?? null;
}