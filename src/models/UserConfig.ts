type UserConfig = {
    defaultOutput: string,
    defaultFileName: string,
    defaultAudioFormat: string,
    defaultVideoFormat: string,
    enableSystemNotification: boolean,
    keepUpToDate: {
        ytDlp: boolean,
        ffmpeg: boolean
    },
    interface: UserInterface,
    authentication: UserAuthentication,
    downloads: UserDownloads,
    postProcessing: UserPostprocessing,
    metadata: UserMetadata,
    accounts?: Account[]
}

type UserInterface = {
    showDownloadProgressNotification: "Detailed" | "Summarized" | "Disabled",
    notificationPosition: "center" | "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
}

type UserDownloads = {
    restrictFilename: boolean,
    trimFilename: number | null,
    disablePartFiles: boolean,
    concurrentDownloads: number | null,
    downloadRateLimit: number | null,
    numberOfRetries: number | null,
    fileAccessRetries: number | null,
    enableSponsorBlock: number | null
}

type UserPostprocessing = {
    embedThumbnailCoverArt: boolean,
    embedChaptersInVideo: boolean,
    embedSubtitles: {
        enabled: boolean,
        lang: string
    },
}

type UserMetadata = {
    downloadThumbnailByDefault: YTDLPOption | null,
    downloadDescriptionInFileDefault: boolean,
    downloadVideoAnnotations: boolean,
    downloadSubtitlesInFile: {
        enabled: boolean,
        type: {
            name:string,
            code:string
        },
        lang: string[],
    },
}

type UserAuthentication = {
    enabled: boolean,
    cookiesTxtFilePath: string,
    cookiesFromBrowser: string,
}