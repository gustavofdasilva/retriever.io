type DownloadInProgress = {
    id: string,
    cancelled:boolean,
    loading:boolean,
    thumbnailUrl: string,
    progress: string,
    info: string,
    title: string,
    channel: string,
    quality: string,
    format: 'Video' | 'Audio',
    length: string,
    path: string,
    dateCreated: Date
}