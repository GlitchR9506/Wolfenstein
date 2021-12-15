import levelEnd from '../../../textures/levelEnd.png'
import uiElements from '../../../textures/uiElements.png'
import font from '../../../textures/font.png'
import Config from '../../Config'
import { Vec2 } from '../../utils'
import UI from './UI'

export default class LevelEnd {
    canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private levelEnd: HTMLImageElement
    private uiElements: HTMLImageElement
    private font: HTMLImageElement

    private displayTime = ''
    private bonusScore = 0
    private animation = 0

    enemiesRatio: string = '0'
    secretsRatio: string = '0'
    treasuresRatio: string = '0'

    constructor() {
        this.canvas = document.createElement('canvas')

        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false;

        this.canvas.width = 320
        this.canvas.height = 200

        this.levelEnd = new Image();
        this.levelEnd.src = levelEnd;

        this.uiElements = new Image();
        this.uiElements.src = uiElements;

        this.font = new Image();
        this.font.src = font;

        setInterval(() => {
            this.animation = this.animation ? 0 : 1
        }, 500)
    }

    calculateValues() {
        UI.instance.endTime = new Date()
        const timeDiff = new Date(UI.instance.endTime.getTime() - UI.instance.startTime.getTime())
        this.displayTime = timeDiff.toTimeString().substring(3, 8)
        const playTimeSeconds = 90 - Math.floor(timeDiff.getTime() / 1000)
        this.bonusScore = playTimeSeconds * 500

        this.enemiesRatio = (Math.floor(UI.instance.enemiesKilled / UI.instance.enemiesCount * 100)).toString()
        this.secretsRatio = (Math.floor(UI.instance.secretsFound / UI.instance.secretsCount * 100)).toString()
        this.treasuresRatio = (Math.floor(UI.instance.treasuresFound / UI.instance.treasuresCount * 100)).toString()

        for (let ratio of [this.enemiesRatio, this.secretsRatio, this.treasuresRatio]) {
            if (ratio == '100') {
                this.bonusScore += 10000
            }
        }
        UI.instance.score += this.bonusScore
    }

    update(deltaTime: number) {
        this.ctx.drawImage(this.levelEnd, 0, 0)
        this.ctx.drawImage(this.uiElements, 81 * this.animation, 60, 81, 87, 20, 16, 81, 87)
        this.drawTime()
        this.drawBonusScore()
        this.drawRatios()
    }

    drawTime() {
        this.drawDigit(parseInt(this.displayTime[0]), 208 + 16 * 0, 80)
        this.drawDigit(parseInt(this.displayTime[1]), 208 + 16 * 1, 80)
        this.drawDigit(parseInt(this.displayTime[3]), 208 + 8 + 16 * 2, 80)
        this.drawDigit(parseInt(this.displayTime[4]), 208 + 8 + 16 * 3, 80)
    }

    drawBonusScore() {
        this.drawDigit(parseInt(this.bonusScore.toString()[0]), 208 + 16 * 0, 56)
        this.drawDigit(parseInt(this.bonusScore.toString()[1]), 208 + 16 * 1, 56)
        this.drawDigit(parseInt(this.bonusScore.toString()[2]), 208 + 16 * 2, 56)
        this.drawDigit(parseInt(this.bonusScore.toString()[3]), 208 + 16 * 3, 56)
        this.drawDigit(parseInt(this.bonusScore.toString()[4]), 208 + 16 * 4, 56)
    }

    drawRatios() {
        for (let i = 0; i < this.enemiesRatio.length; i++) {
            this.drawDigit(parseInt(this.enemiesRatio[this.enemiesRatio.length - 1 - i]), 280 - 16 * i, 112 + 16 * 0)
        }
        for (let i = 0; i < this.secretsRatio.length; i++) {
            this.drawDigit(parseInt(this.secretsRatio[this.secretsRatio.length - 1 - i]), 280 - 16 * i, 112 + 16 * 1)
        }
        for (let i = 0; i < this.treasuresRatio.length; i++) {
            this.drawDigit(parseInt(this.treasuresRatio[this.treasuresRatio.length - 1 - i]), 280 - 16 * i, 112 + 16 * 2)
        }
    }

    private drawDigit(digit: number, x: number, y: number) {
        this.ctx.drawImage(this.font, 16 * digit, 0, 16, 16, x, y, 16, 16)
    }
}