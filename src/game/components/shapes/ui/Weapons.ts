import { degToRad, m4, Vec2, Vec3 } from '../../utils'
import { Weapon, weaponType } from './Weapon'
import texture from '../../../textures/weapons.png'
import Config from '../../Config'
import Input from '../../Input'
import UI from './UI'
import knife from "../../../sounds/DSWKNIF.wav"
import pistol from "../../../sounds/WSND0005.wav"
import machinegun from "../../../sounds/WSND0004.wav"
import chaingun from "../../../sounds/WSND0006.wav"


export default class Weapons {
    importedTexture = texture

    availableTypes: weaponType[] = ['knife', 'pistol']
    // availableTypes: weaponType[] = ['knife', 'pistol', 'machinegun', 'chaingun']

    private weapons: Weapon[] = []
    private texturesCount = new Vec2(8, 4)
    private textureNumber: number
    private texture: HTMLImageElement

    private timeSinceLastUpdate = 0

    constructor() {
        this.texture = new Image()
        this.texture.src = texture

        this.weapons.push(new Weapon("knife", 2.4, 40, [0, 1, 2, 3, 4], [], 3, knife))
        this.weapons[0].range = Config.gridSize * 0.75
        this.weapons.push(new Weapon("pistol", 2.4, 70, [8, 9, 10, 11, 12], [], 10, pistol))
        this.weapons.push(new Weapon("machinegun", 6, 70, [16, 17], [18, 19], 19, machinegun))
        this.weapons.push(new Weapon("chaingun", 12, 70, [24, 25], [26, 27], 26, chaingun))

        this.textureNumber = this.currentWeapon.initTextures[0]
    }

    get textureSize() {
        return this.texturesCount.map(v => 1 / v)
    }

    get currentWeapon() {
        return this.weapons.find(weapon => weapon.type == UI.instance.weapon)
    }

    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime

        if (0 < Input.instance.lastNumber && Input.instance.lastNumber <= this.weapons.length) {
            for (let i = 0; i < this.weapons.length; i++) {
                if (Input.instance.lastNumber == i + 1) {
                    if (this.availableTypes.includes(this.weapons[i].type)) {
                        UI.instance.weapon = this.weapons[i].type
                    }
                }
            }
        }

        this.setShooting(Input.instance.shooting && UI.instance.ammo > 0)
        if (Input.instance.shot && (UI.instance.ammo > 0 || this.currentWeapon.type == 'knife')) {
            this.shoot()
            Input.instance.justShot = true
        }

        if (this.currentWeapon.justShot) {
            this.decreaseAmmo()
            this.currentWeapon.audio.play()
        }

        const frameTime = 1 / (this.currentWeapon.fireRate * this.currentWeapon.framesCount)

        this.currentWeapon.justShot = false

        if (this.timeSinceLastUpdate >= frameTime) {
            this.timeSinceLastUpdate = 0
            this.textureNumber = this.currentWeapon.getNextTexture()
        }

    }

    private decreaseAmmo() {
        if (this.currentWeapon.type != 'knife') {
            if (UI.instance.ammo > 0) {
                UI.instance.ammo--
            }
        }
    }

    private shoot() {
        if (!this.currentWeapon.isAutomatic) {
            this.currentWeapon.willShoot = true
        }
    }

    private setShooting(shooting: boolean) {
        if (this.currentWeapon.isAutomatic) {
            this.currentWeapon.shooting = shooting
        }
    }

    draw(context: CanvasRenderingContext2D) {
        // x 322 - pół szerokości
        // y 312 - wysokość
        const width = 64
        const height = 64
        const row = Math.floor(this.textureNumber / this.texturesCount.x)
        const col = this.textureNumber % this.texturesCount.x
        // console.log(this.textureNumber)
        context.drawImage(
            this.texture,
            64 * col,
            64 * row,
            64,
            64,
            (317.5 - (width * 4.8 / 2)) * Config.uiScale,
            (312 - (height * 4.8)) * Config.uiScale,
            width * Config.uiScale * 4.8,
            height * Config.uiScale * 4.8
        )
    }
}