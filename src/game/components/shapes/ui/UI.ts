import Config from '../../Config';
import uiTexture from '../../../textures/ui.png'
import uiElements from '../../../textures/uiElements.png'
import startScreen from '../../../textures/startScreen.png'
import Menu from './Menu';

import audioSplash from "../../../sounds/theme_splash.mp3"
import audioMenu from "../../../sounds/theme_menu.mp3"
import audioLevel from "../../../sounds/theme_level.mp3"
import BetterAudio from '../../BetterAudio'
import LevelEnd from './LevelEnd';
import Weapons from './Weapons';
import LoadingScreen from './LoadingScreen';


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
    startScreen: HTMLImageElement
    context: CanvasRenderingContext2D
    weapons: Weapons
    loadingScreen: LoadingScreen

    audioSplash = new BetterAudio(audioSplash, Config.musicVolume)
    audioMenu = new BetterAudio(audioMenu, Config.musicVolume)
    audioLevel = new BetterAudio(audioLevel, Config.musicVolume)

    floor: number = 1
    score: number = 0
    lives: number = 3
    health: number = 100
    ammo: number = 8
    weapon: string = 'pistol'

    faceDirection: FaceDirection = "right"
    faceState: FaceState = "normal"
    faceAnimationSteps: FaceAnimationStep[] = []
    lastFaceAnimationStepsCount: number = null

    showingMenu = true

    state = 'startScreen'

    menu: Menu
    levelEnd: LevelEnd

    flashing = false
    flashCompletion = 0
    flashDuration = 0.2
    flashColor: string
    flashIntensity: number

    startTime: Date
    endTime: Date

    enemiesKilled: number = 0
    secretsFound: number = 0
    treasuresFound: number = 0

    enemiesCount: number
    secretsCount: number
    treasuresCount: number

    constructor() {
        this.menu = new Menu()
        this.loadingScreen = new LoadingScreen()
        this.levelEnd = new LevelEnd()
        this.audioSplash.loop()
        this.audioMenu.loop()
        this.audioLevel.loop()
    }

    init() {
        this.texture = new Image();
        this.texture.src = uiTexture;

        this.elements = new Image();
        this.elements.src = uiElements;

        this.startScreen = new Image();
        this.startScreen.src = startScreen;

        const uiCanvas = document.getElementById("uiCanvas") as HTMLCanvasElement
        uiCanvas.width = 640 * Config.uiScale
        uiCanvas.height = 400 * Config.uiScale

        this.context = uiCanvas.getContext('2d') as CanvasRenderingContext2D
        this.context.imageSmoothingEnabled = false;

        uiCanvas.onclick = () => { if (this.state == "startScreen") this.audioSplash.playIfNotPlayed() }
        document.onkeydown = () => { if (this.state == "startScreen") this.audioSplash.playIfNotPlayed() }
        document.onkeyup = () => { if (this.state == "startScreen") this.audioSplash.playIfNotPlayed() }
        this.weapons = new Weapons()
    }

    takeLife() {
        if (this.lives == 0) {
            this.floor = 1
        } else {
            this.lives--
        }
        this.health = 100
        this.ammo = 8
        this.weapon = "pistol"
    }

    update(deltaTime: number) {
        this.weapons.update(deltaTime)
        this.loadingScreen.update(deltaTime)
        const currentStep = this.faceAnimationSteps[0]
        if (currentStep) {
            currentStep.duration -= deltaTime
            if (currentStep.duration <= 0) {
                this.faceAnimationSteps.shift()
            }
            if (this.faceAnimationSteps.length == 0) {
                this.startFaceAnimation()
            }
            this.faceDirection = this.faceAnimationSteps[0].direction
        }
        if (!currentStep) {
            this.startFaceAnimation()
        }
        this.menu.update(deltaTime)
        this.levelEnd.update(deltaTime)
        if (this.flashing) {
            this.flashCompletion += deltaTime / this.flashDuration
            if (this.flashCompletion >= 1) {
                this.flashCompletion = 0
                this.flashing = false
            }
        }
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
        this.context.drawImage(canvas, 16 * Config.uiScale, 8 * Config.uiScale, 608 * Config.uiScale, 304 * Config.uiScale)
        this.context.drawImage(this.texture, 0, 0, 640 * Config.uiScale, 400 * Config.uiScale)
        this.drawNumber(this.floor, 64, 352)
        this.drawNumber(this.score, 192, 352)
        this.drawNumber(this.lives, 240, 352)
        this.drawNumber(this.health, 384, 352)
        this.drawNumber(this.ammo, 464, 352)
        this.drawWeaponUI()
        this.weapons.draw(this.context)
        this.drawFace()
        if (this.flashing) {
            this.context.fillStyle = `rgba(${this.flashColor}, ${(1 - this.flashCompletion) * this.flashIntensity})`
            // this.context.fillStyle = `rgba(${this.flashColor}, ${(1 - this.flashCompletion) * 0.6})`
            this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        }
        if (this.state == "startScreen") {
            this.context.drawImage(this.startScreen, 0, 0, 640 * Config.uiScale, 400 * Config.uiScale)
        } else if (this.state == "menu") {
            this.context.drawImage(this.menu.canvas, 0, 0, 640 * Config.uiScale, 400 * Config.uiScale)
        } else if (this.state == "loading") {
            this.context.drawImage(this.loadingScreen.canvas, 0, 0, 640 * Config.uiScale, 400 * Config.uiScale)
        } else if (this.state == "end") {
            this.context.drawImage(this.levelEnd.canvas, 0, 0, 640 * Config.uiScale, 400 * Config.uiScale)
        }
    }

    drawFace() {
        let faceColumn = 0
        let faceRow = 0
        if (this.health == 0) {
            faceRow = 7
            faceColumn = 1
        } else if (this.faceState == 'normal') {
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

    drawWeaponUI() {
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

    deadScreen() {

    }

    flashRed() {
        this.flashColor = "255, 0, 0"
        this.flashIntensity = 0.3
        this.flashing = true
    }

    flashYellow() {
        this.flashColor = "255, 255, 0"
        this.flashIntensity = 0.2
        this.flashing = true
    }
}