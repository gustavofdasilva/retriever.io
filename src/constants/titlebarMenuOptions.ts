import { exit } from '@tauri-apps/plugin-process';

const titlebarMenuOptions = [
    {
        label: 'App',
        items: [
            {
                label: 'Minimize',
                command: () => {

                },
            },
            {
                label: 'Settings',
                command: () => {

                },
            },
            {
                label: 'Import URLs by file',
                command: () => {
                    
                },
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
                label: 'Cancel All Downloads',
                command: () => {

                },
            },
            {
                label: 'Clear all recent downloads',
                command: () => {

                },
            },
        ],
    },
    {
        label: 'View',
        items: [
            {
                label: 'Toggle full screen',
                command: () => {

                },
            },
            {
                label: 'Zoom in',
                command: () => {

                },
            },
            {
                label: 'Zoom out',
                command: () => {

                },
            },
        ],
    },
    {
        label: 'Help',
        items: [
            {
                label: 'Tutorials',
                icon:'pi pi-external-link',
                command: () => {

                },
            },
            {
                label: 'Docs',
                icon:'pi pi-external-link',
                command: () => {

                },
            },
            {
                label: 'Repository in github',
                icon:'pi pi-external-link',
                command: () => {

                },
            },
        ],
    },
    {
        label: 'Contact',
    }
]

export default titlebarMenuOptions;