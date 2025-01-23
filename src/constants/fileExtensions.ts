
export const videoExtensions = [
    {name:'.mp4',code:"mp4"},
    {name:'.m4a',code:"m4a"},
]

export const audioExtensions = [
    {name:'.mp3',code:"mp3"},
    {name:'.wav',code:"wav"},
]

export const fileExtensions = [
    {name:'Any (Only audio)',code:"anyaudio"},
    {name:'Any (Only video)',code:"anyvideo"},
    ...audioExtensions,
    ...videoExtensions
]

export const formats = [
    {name:"Audio",code:"Audio"},
    {name:"Video",code:"Video"},
]