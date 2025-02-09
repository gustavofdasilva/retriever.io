const ytdlpVariables = [
    {
        label:'Title',
        value:'%(title)s'
    },
    {
        label:'Channel',
        value:'%(channel)s'
    },
    {
        label:'Upload date',
        value:'%(upload_date)s'
    },
    {
        label:'Duration',
        value:'%(duration_string)s'
    },
    {
        label:'Location',
        value:'%(location)s'
    },
]

export const supportedLangs: YTDLPOptions = [
    {
        name: "All available",
        code: "all"
    },
    {
        name: "English",
        code: "en.*"
    },
    {
        name: "Spanish",
        code: "es.*"
    },
]

export default ytdlpVariables;