import menuUnselected from '../../../textures/menuUnselected.png'
import menuSelected from '../../../textures/menuSelected.png'
import menuSelectedBlink from '../../../textures/menuSelectedBlink.png'
import Config from '../../Config'
import { Vec2 } from '../../utils'
import BetterAudio from '../../BetterAudio'
import audioSelect from '../../../sounds/Menu Select.wav'
import audioToggle from '../../../sounds/Menu Toggle.wav'
import UI from './UI'

export default class Menu {
    canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private menuUnselected: HTMLImageElement
    private menuSelected: HTMLImageElement
    private menuSelectedBlink: HTMLImageElement
    audioSelect = new BetterAudio(audioSelect)
    audioToggle = new BetterAudio(audioToggle)
    option = 0

    constructor() {
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')

        this.canvas.width = 640
        this.canvas.height = 400
        console.log('created')

        this.menuUnselected = new Image();
        this.menuUnselected.src = menuUnselected;

        this.menuSelected = new Image();
        this.menuSelected.src = menuSelected;

        this.menuSelectedBlink = new Image();
        this.menuSelectedBlink.src = menuSelectedBlink;

        addEventListener("keydown", e => {
            if (UI.instance.state == "menu") {
                if (e.code == "ArrowDown" || e.code == "ArrowUp") {
                    if (this.option == 0) {
                        this.option = 8
                    } else {
                        this.option = 0
                    }
                    this.audioToggle.play()
                }
            }
        })
    }

    private timeSinceLastBlink = 0
    private timeSinceBlinkStart = 0
    private readonly blinkInterval = 1
    private readonly blinkDuration = 0.1

    private readonly optionSize = new Vec2(300, 26)

    update(deltaTime: number) {
        this.ctx.drawImage(this.menuUnselected, 0, 0)

        let image = this.menuSelected
        this.timeSinceLastBlink += deltaTime
        if (this.timeSinceLastBlink >= this.blinkInterval) {
            image = this.menuSelectedBlink
        }
        if (image == this.menuSelectedBlink) {
            this.timeSinceBlinkStart += deltaTime
            if (this.timeSinceBlinkStart >= this.blinkDuration) {
                this.timeSinceLastBlink = 0
                this.timeSinceBlinkStart = 0
            }
        }


        this.ctx.drawImage(
            image,
            150,
            108 + this.option * this.optionSize.y,
            this.optionSize.x,
            this.optionSize.y,
            150,
            108 + this.option * this.optionSize.y,
            this.optionSize.x,
            this.optionSize.y
        )
    }
}