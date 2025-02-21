import { exit } from '@tauri-apps/plugin-process';
import { useLoadingStore } from '../stores/loading';
import { invoke } from '@tauri-apps/api/core';
import toasteventbus from 'primevue/toasteventbus';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/plugin-shell';

const titlebarMenuOptions = [
    {
        label: 'App',
        items: [
            {
                label: 'Minimize',
                command: () => {
                    const appWindow = getCurrentWindow();
                    appWindow.minimize();
                },
            },
            {
                label: 'Settings',
                command: () => {},
            },
            {
                label: 'Quit',
                command: () => {
                    exit(0);
                },
            },
            
        ],
    },
    {
        label: 'Downloads',
        items: [
            {
                label: 'Cancel all downloads',
                command: () => {
                    killAllProcess();
                    cancelAllDownloadsPending();
                },
            },
            {
                label: 'Cancel all pending downloads',
                command: () => {
                    cancelAllDownloadsPending();
                },
            },
            {
                label: 'Cancel all in progress downloads',
                command: () => {
                    killAllProcess();
                },
            },
            // {
            //     label: 'Clear all recent downloads',
            //     command: () => {

            //     },
            // },
        ],
    },
    {
        label: 'View',
        items: [
            {
                label: 'Toggle full screen',
                command: () => {
                    const appWindow = getCurrentWindow();
                    appWindow.toggleMaximize();
                },
            },
            //! REFACTOR: Zoom in and out is not working properly
            // {
            //     label: 'Zoom in',
            //     command: () => {
            //         document.body.style.zoom=String(Number(document.body.style.zoom)+0.1);
            //     },
            // },
            // {
            //     label: 'Zoom out',
            //     command: () => {
            //         document.body.style.zoom=String(Number(document.body.style.zoom)-0.1);
            //     },
            // },
            // {
            //     label: 'Reset zoom',
            //     command: () => {
            //         document.body.style.zoom="1";
            //     },
            // },
        ],
    },
    {
        label: 'Help',
        items: [
            // {
            //     label: 'Tutorials',
            //     icon:'pi pi-external-link',
            //     command: () => {

            //     },
            // },
            // {
            //     label: 'Docs',
            //     icon:'pi pi-external-link',
            //     command: () => {

            //     },
            // },
            {
                label: 'Repository in github',
                icon:'pi pi-external-link',
                command: () => {
                    open('https://github.com/gustavofdasilva/retrieverplusplus')
                },
            },
        ],
    },
]

export default titlebarMenuOptions;

function killAllProcess() {
    const loadingStore = useLoadingStore();

    if(loadingStore.getActiveDownloads.length == 0) {
        return
    }

    loadingStore.getActiveDownloads.forEach((download)=>{
      loadingStore.setActiveDownloadById(download.id,
        ['cancelled'],
        [true]
      )
    });
    
    let intervalCount=0;
    const intervalId = setInterval(()=>{
        intervalCount++;

        if(intervalCount >= 5) {
            clearInterval(intervalId);
        }

        invoke('kill_active_process');
    },500)

    
    newNotification("Downloads cancelled",3000);
    loadingStore.setLoading(false); 
}

function cancelAllDownloadsPending() {
    const loadingStore = useLoadingStore();

    if(loadingStore.getPendingDownloads.length == 0) {
        return
    }

    loadingStore.getPendingDownloads.forEach((download)=>{
        loadingStore.removePendingDownloadById(download.id);
    })
    
    newNotification("Pending downloads cancelled",3000);
}

function newNotification(message: string, life: number) {
    toasteventbus.emit('add', {
        severity: 'secondary',
        summary: 'Download log',
        detail: message,
        life: life,
        closable: true
    })
}