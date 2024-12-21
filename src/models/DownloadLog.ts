type DownloadLog = {
    thumbnailUrl: string,
    title: string,
    channel: string,
    quality: string,
    format: 'Video' | 'Audio',
    length: number,
    path: string
}