import { defineStore } from "pinia";
import { addToHist, clearHist, createHistFile, readHistFile } from '../helpers/history';
import { useMediaStore } from "./media";

export const useDownloadLogStore = defineStore("downloadLog", {
    state: () =>({downloadLog: [] as DownloadLog[]}),
    getters: {
        getDownloadLog: (state)=>state.downloadLog,
    },
    actions: { 
        setDownloadLog(newDownloadLog: DownloadLog[]) {
            this.downloadLog = newDownloadLog
        },
        async loadDownloadHistory() {
            const downloadArr = await readHistFile()

            if(downloadArr != null) {
                if(downloadArr.length == 0) {
                    await createHistFile();
                    this.loadDownloadHistory();
                    return
                }

                this.setDownloadLog(downloadArr);
            }
        },
    }
})