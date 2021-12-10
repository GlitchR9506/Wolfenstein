import Config from '../../Config';
import uiTexture from '../../../textures/ui.png'
import uiElements from '../../../textures/ui-elements.png'
import Camera from '../../Camera';

type FaceDirection = "left" | "normal" | "right"
type FaceState = "normal" | "dead" | "win"
type FaceAnimationStep = {
    direction: FaceDirection,
    duration: number,
}

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
    // health: number = 72
    // ammo: number = 8
    ammo: number = 999
    weapon: string = 'pistol'

    faceDirection: FaceDirection = "right"
    faceState: FaceState = "normal"
    faceAnimationSteps: FaceAnimationStep[] = []
    lastFaceAnimationStepsCount: number = null

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

    update(deltaTime: number) {
        if (this.health <= 0) {
            this.faceState = "dead"
        }
        const currentStep = this.faceAnimationSteps[0]
        if (currentStep) {
            currentStep.duration -= deltaTime
            if (currentStep.duration <= 0) {
                this.faceAnimationSteps.shift()
            }
            if (this.faceAnimationSteps.length == 0) {
                console.log('startnew')
                this.startFaceAnimation()
            }
            this.faceDirection = this.faceAnimationSteps[0].direction
        }
        if (!currentStep) {
            console.log('startnew')
            this.startFaceAnimation()
        }
        console.log(currentStep)
    }

    startFaceAnimation() {
        const stepsCount = this.lastFaceAnimationStepsCount == 3 ? 5 : 3
        for (let i = 0; i < stepsCount; i++) {
            const min = 0.5
            const max = 1.5
            const duration = Math.random() * (max - min) + min;
            let direction: FaceDirection
            if (i % 2) {
                direction = 'right'
            } else {
                direction = 'left'
            }
            this.faceAnimationSteps.push({ direction, duration })
        }
        this.lastFaceAnimationStepsCount = this.faceAnimationSteps.length
        this.faceAnimationSteps.push({ direction: 'normal', duration: 2 })
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
        this.drawFace()
    }

    drawFace() {
        let faceColumn = 0
        let faceRow = 0

        if (this.faceState == 'normal') {
            if (this.faceDirection == 'left') {
                faceColumn = 0
            } else if (this.faceDirection == 'normal') {
                faceColumn = 1
            } else if (this.faceDirection == 'right') {
                faceColumn = 2
            }

            faceRow = Math.floor(this.health / (100 / 7))
            if (faceRow == 7) {
                faceRow = 6
            }
            faceRow = 6 - faceRow
        } else if (this.faceState == 'win') {
            faceRow = 7
            faceColumn = 0
        } else if (this.faceState == 'dead') {
            faceRow = 7
            faceColumn = 1
        }

        this.context.drawImage(
            this.elements,
            240 + 24 * faceColumn,
            31 * faceRow,
            24,
            31,
            274 * Config.uiScale,
            330 * Config.uiScale,
            48 * Config.uiScale,
            62 * Config.uiScale
        )
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