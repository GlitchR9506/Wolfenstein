import Config from "./Config"

export default class BetterAudio {
    audio: HTMLAudioElement
    canBePaused = false

    constructor(sound: string, volume?: number) {
        this.audio = new Audio(sound)
        this.audio.volume = volume || Config.soundVolume
    }

    play() {
        // this.audio.pause()
        this.audio.currentTime = 0
        this.audio.play()
        // if (this.canBePaused) {
        //     this.audio.pause()
        //     this.audio.currentTime = 0
        // }
        // this.canBePaused = false
        // this.audio.play().then(() => {
        //     this.canBePaused = false
        // })
    }

    playIfNotPlayed() {
        if (this.audio.currentTime == 0) {
            this.audio.play()
        }
    }

    pause() {
        this.audio.pause()
    }

    loop() {
        this.audio.loop = true
    }
}