import Config from '../../Config';
import uiTexture from '../../../textures/ui.png'
import uiElements from '../../../textures/ui-elements.png'
import { weaponType } from './Weapon';

export default class UI {
    static instance = new this
    texture: HTMLImageElement
    elements: HTMLImageElement
    context: CanvasRenderingContext2D

    floor: number = 1
    score: number = 0
    lives: number = 3
    // health: number = 100
    health: number = 72
    // ammo: number = 8
    ammo: number = 999
    weapon: string = 'pistol'

    init() {
        this.texture = new Image();
        this.texture.src = uiTexture;

        this.elements = new Image();
        this.elements.src = uiElements;

        const uiCanvas = document.getElementById("uiCanvas") as HTMLCanvasElement
        uiCanvas.width = 640 * Config.uiScale
        uiCanvas.height = 400 * Config.uiScale

        this.context = uiCanvas.getContext('2d') as CanvasRenderingContext2D
        this.context.imageSmoothingEnabled = false;

    }

    draw(canvas: HTMLCanvasElement) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.drawImage(canvas, 16 * Config.uiScale, 8 * Config.uiScale)
        this.context.drawImage(this.texture, 0, 0, 640 * Config.uiScale, 400 * Config.uiScale)
        this.drawNumber(this.floor, 64, 352)
        this.drawNumber(this.score, 192, 352)
        this.drawNumber(this.lives, 240, 352)
        this.drawNumber(this.health, 384, 352)
        this.drawNumber(this.ammo, 464, 352)
        this.drawWeapon()
    }

    drawWeapon() {
        let weaponNumber = 0
        if (this.weapon == 'knife') {
            weaponNumber = 0
        } else if (this.weapon == 'pistol') {
            weaponNumber = 1
        } else if (this.weapon == 'machinegun') {
            weaponNumber = 2
        } else if (this.weapon == 'chaingun') {
            weaponNumber = 3
        }
        this.context.drawImage(
            this.elements,
            48 * weaponNumber,
            0,
            48,
            24,
            512 * Config.uiScale,
            336 * Config.uiScale,
            96 * Config.uiScale,
            48 * Config.uiScale
        )
    }

    private drawNumber(number: number, x: number, y: number) {
        const digits = number.toString().split('').reverse().map(digit => parseInt(digit))
        const digitWidth = 16
        for (let [i, digit] of digits.entries()) {
            this.drawDigit(digit, x - digitWidth * (i + 1), y)
        }
    }

    private drawDigit(digit: number, x: number, y: number) {
        this.context.drawImage(
            this.elements,
            8 * digit,
            32,
            8,
            16,
            x * Config.uiScale,
            y * Config.uiScale,
            16 * Config.uiScale,
            32 * Config.uiScale
        )
    }

}