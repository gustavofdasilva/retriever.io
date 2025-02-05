type UserConfig = {
    defaultOutput: string,
    defaultFileName: string,
    defaultAudioFormat: string,
    defaultVideoFormat: string,
    authentication: UserAuthentication,
    accounts?: Account[]
}

type UserAuthentication = {
    enabled: boolean,
    cookiesTxtFilePath: string,
    cookiesFromBrowser: string,
}