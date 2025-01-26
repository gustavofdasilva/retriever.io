//the file extensions, bitrate and resolution options array are similar. They are arrays of objects with a name and a code property. 
// The findConfigCode function is used to send the selected info formatted to the backend
export const findConfigCode = (value: string, arr: YTDLPOptions): string => {
    return arr.find((el) => el.name === value)?.code ?? '';
}

export const checkFormat = (value: string): string => {
    
    if(value == "m4a" ||
    value == "aac" ||
    value == "mp3" ||
    value == "ogg" ||
    value == "opus" ||
    value == "webm" ||
    value == "wav" || 
    value == "anyaudio") {
        return 'Audio'
    }

    return 'Video'
}
