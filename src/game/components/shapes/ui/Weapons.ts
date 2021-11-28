import { degToRad, m4, Vec2, Vec3 } from '../../utils'
import Plane from '../Plane'
import { Weapon, weaponType } from './Weapon'
import texture from '../../../textures/weapons.png'
import Config from '../../Config'
import Input from '../../Input'
import { Program } from '../../programs/Program'


export default class Weapons extends Plane {
    importedTexture = texture

    ammo = 10
    type: weaponType = 'pistol'
    justShot = false

    private weapons: Weapon[] = []
    private texturesCount = new Vec2(4, 8)
    private currentTextureNumber: number

    private timeSinceLastUpdate = 0

    constructor(gl: WebGLRenderingContext, program: Program) {
        super(gl, program)
        this.transform.position.z = -2
        this.transform.rotation.x = degToRad(90)
        this.transform.scale = Vec3.one.multiply(1)
        this.transform.position.y = -0.66
        this.setInitialState()

        this.weapons.push(new Weapon("knife", 2.4, 70, [0, 1, 2, 3, 2, 1], [], 3))
        this.weapons[0].range = Config.gridSize * 0.75
        this.weapons.push(new Weapon("pistol", 2.4, 100, [4, 5, 6, 7, 5], [], 7))
        this.weapons.push(new Weapon("machinegun", 6, 100, [8, 9], [10, 11], 11))
        this.weapons.push(new Weapon("chaingun", 12, 100, [12, 13], [14, 15], 14))

        this.setTexture(this.currentWeapon.initTextures[0])
    }

    get textureSize() {
        return this.texturesCount.map(v => 1 / v)
    }

    get currentWeapon() {
        return this.weapons.find(weapon => weapon.type == this.type)
    }

    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime

        if (0 < Input.instance.lastNumber && Input.instance.lastNumber <= this.weapons.length) {
            for (let i = 0; i < this.weapons.length; i++) {
                if (Input.instance.lastNumber == i + 1) {
                    this.type = this.weapons[i].type
                }
            }
        }

        this.setShooting(Input.instance.shooting && this.ammo > 0)
        if (Input.instance.shot && (this.ammo > 0 || this.currentWeapon.type == 'knife')) {
            this.shoot()
            Input.instance.justShot = true
        }

        if (this.currentWeapon.justShot) {
            this.decreaseAmmo()
        }

        const frameTime = 1 / (this.currentWeapon.fireRate * this.currentWeapon.framesCount)

        this.currentWeapon.justShot = false

        if (this.timeSinceLastUpdate >= frameTime) {
            this.timeSinceLastUpdate = 0
            this.setTexture(this.currentWeapon.getNextTexture())
        }
    }

    bindTransform(matrixLocation: WebGLUniformLocation, viewProjectionMatrix: number[]) {
        let matrix = m4.identity
        matrix = m4.scale(matrix, this.transform.scale);
        matrix = m4.xRotate(matrix, this.transform.rotation.x);
        matrix = m4.yRotate(matrix, this.transform.rotation.y);
        matrix = m4.zRotate(matrix, this.transform.rotation.z);
        matrix = m4.translate(matrix, this.transform.position);
        matrix = m4.multiply(matrix, viewProjectionMatrix);
        this.gl.uniformMatrix4fv(matrixLocation, false, matrix);
    }

    private decreaseAmmo() {
        if (this.currentWeapon.type != 'knife') {
            if (this.ammo > 0) {
                this.ammo--
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

    private setTexture(textureNumber: number) {
        if (textureNumber == this.currentTextureNumber) return
        this.currentTextureNumber = textureNumber
        const currentVerticesVec2Array = Vec2.arrayToVec2Array(this.initialTexcoords)
        const texturePos = new Vec2(textureNumber % this.texturesCount.x, Math.floor(textureNumber / this.texturesCount.x)).multiplyByVector(this.textureSize)
        const newVerticesVec2Array = currentVerticesVec2Array.map(vec2 => vec2.multiplyByVector(this.textureSize).add(texturePos))
        this.TEXCOORDS = new Float32Array(Vec2.vec2ArrayToArray(newVerticesVec2Array))
    }
}