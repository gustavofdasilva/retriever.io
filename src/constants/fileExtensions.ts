
export const videoExtensions: YTDLPOptions = [
    {name:'.avi',code:"avi"},
    {name:'.flv',code:"flv"},
    {name:'.mkv',code:"mkv"},
    {name:'.mov',code:"mov"},
    {name:'.mp4',code:"mp4"},
    {name:'.webm',code:"webm"},
]

export const audioExtensions: YTDLPOptions = [
    {name:'.aac',code:"aac"},
    {name:'.alac',code:"alac"},
    {name:'.flac',code:"flac"},
    {name:'.m4a',code:"m4a"},
    {name:'.mp3',code:"mp3"},
    {name:'.opus',code:"opus"},
    {name:'.vorbis',code:"vorbis"},
    {name:'.wav',code:"wav"},
]

export const imageExtensions: YTDLPOptions = [
    {name:'.png',code:"png"},
    {name:'.jpg',code:"jpg"},
    {name:'.webp',code:"webp"},
]

export const fileExtensions: YTDLPOptions = [
    {name:'Any (Only audio)',code:"anyaudio"},
    {name:'Any',code:"anyvideo"},
    ...audioExtensions,
    ...videoExtensions
]

export const formats: YTDLPOptions = [
    {name:"Audio",code:"Audio"},
    {name:"Video",code:"Video"},
]