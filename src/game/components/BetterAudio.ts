export default class BetterAudio {
    audio: HTMLAudioElement

    constructor(sound: string) {
        this.audio = new Audio(sound)
        this.audio.volume = 0.1
    }

    play() {
        this.audio.pause()
        this.audio.currentTime = 0
        this.audio.play()
    }
}