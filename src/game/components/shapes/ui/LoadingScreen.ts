import uiElements from '../../../textures/uiElements.png'
import Config from '../../Config'
import UI from './UI'

export default class LoadingScreen {
    canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private uiElements: HTMLImageElement
    private progress = 0
    private state = "beforeLoading"
    private readonly loadingTime = 2
    private readonly beforeLoadingDelay = 0.5
    private readonly afterLoadingDelay = 0.5

    constructor() {
        this.canvas = document.createElement('canvas')

        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false;

        this.canvas.width = 320
        this.canvas.height = 200

        this.uiElements = new Image();
        this.uiElements.src = uiElements;
    }

    update(deltaTime: number) {
        if (UI.instance.state != 'loading') return
        this.ctx.fillStyle = "#004141"
        this.ctx.fillRect(0, 0, 320, 160)
        this.ctx.drawImage(
            this.uiElements,
            0,
            160,
            224,
            48,
            96 / 2,
            112 / 2,
            224,
            48
        )
        if (this.state == 'beforeLoading') {
            this.progress += deltaTime
            if (this.progress >= this.beforeLoadingDelay) {
                this.state = "loading"
                this.progress = 0
            }
        } else if (this.state == 'loading') {
            this.progress += deltaTime / this.loadingTime
            if (this.progress >= 1) {
                this.progress = 0
                this.state = "afterLoading"
            }
        } else if (this.state == 'afterLoading') {
            this.progress += deltaTime
            if (this.progress >= this.afterLoadingDelay) {
                this.progress = 0
                UI.instance.state = 'game'
                UI.instance.startTime = new Date()
            }
        }

        if (this.state != 'beforeLoading') {
            let width = 214 * this.progress
            if (this.state == 'afterLoading') {
                width = 214
            }
            if (width > 0) {
                this.ctx.fillStyle = "#ff0000"
                this.ctx.fillRect(53, 101, width, 2)
                this.ctx.fillStyle = "#ff9e9e"
                this.ctx.fillRect(53, 101, width - 1, 1)
            }
        }
    }
}