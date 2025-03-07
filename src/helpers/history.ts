import { Store } from "@tauri-apps/plugin-store";
import { useDownloadLogStore } from "../stores/downloadLog";
import { exit } from "@tauri-apps/plugin-process";

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
    await useDownloadLogStore().loadDownloadHistory();
}

export async function clearHist() {
    const store = await Store.load('download-history.json');
    await store.reset();
    await useDownloadLogStore().loadDownloadHistory();
    exit();//REFACTOR: relaunch() instead of exit()
}

export async function createHistFile() {
    const store = await Store.load('download-history.json',{
        createNew: true,   
    })
    
    store.set('download-history',[]);
}

export async function deleteRegister(title: string, timestamp: Date) {
    const store = await Store.load('download-history.json')

    const data = await store.get<DownloadLog[]>('download-history');

    const newData = data?.filter((item)=>{
        return !(item.title == title && new Date(item.dateCreated).toISOString()==timestamp.toISOString())
    })

    await store.set('download-history',newData);
}

export async function readHistFile(): Promise<DownloadLog[] | null> {
    const store = await Store.load('download-history.json')

    const data = await store.get<DownloadLog[]>('download-history');

    data?.sort((a,b)=>{
        const dateA = new Date(a.dateCreated).getTime();
        const dateB = new Date(b.dateCreated).getTime();
        return dateA < dateB ? 1: -1;
    })

    return data ?? null;
}