import Config from "./Config"

export default class BetterAudio {
    audio: HTMLAudioElement
    private playLoading = false
    private playPromise: Promise<void>
    name

    constructor(sound: string, volume?: number) {
        this.audio = new Audio(sound)
        this.name = sound
        this.audio.volume = volume || Config.soundVolume
    }

    play() {
        this.audio.currentTime = 0
        this.playLoading = true
        this.playPromise = this.audio.play()
        this.playPromise.then(() => this.playLoading = false)
    }

    playIfNotPlayed() {
        // const isPlaying = this.audio.currentTime > 0 && !this.audio.paused && !this.audio.ended && this.audio.readyState > this.audio.HAVE_CURRENT_DATA;

        // if (!isPlaying) {
        //     this.audio.currentTime = 0
        //     this.audio.play();
        // }
        if (this.audio.currentTime == 0) {
            this.playLoading = true
            this.playPromise = this.audio.play()
            this.playPromise.then(() => this.playLoading = false)
        }
    }

    pause() {
        if (this.playLoading) {
            this.playPromise.then(() => this.audio.pause())
        } else {
            this.audio.pause();
        }
    }

    loop() {
        this.audio.loop = true
    }
}