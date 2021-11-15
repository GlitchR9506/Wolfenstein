import { degToRad, m4, Vec2, Vec3 } from '../utils'
import Plane from './Plane'
import WeaponData from './WeaponData'
import texture from '../../textures/weapons.png'

export default class Weapons extends Plane {
    static importedTexture = texture

    type = 'pistol'
    shooting = false
    shot = false

    private weapons: WeaponData[] = []
    private texturesCount = new Vec2(4, 8)
    private currentTextureNumber: number

    private timeSinceLastUpdate = 0
    private frameTextureIndex = 0
    private stoppedShootingIndex = 0

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.position.z = -2
        this.transform.rotation.x = degToRad(90)
        this.transform.scale = Vec3.one.multiply(1)
        this.transform.position.y = -0.66
        this.setInitialState()

        this.weapons.push(new WeaponData("knife", 2.4, [0, 1, 2, 3, 2, 1], []))
        this.weapons.push(new WeaponData("pistol", 2.4, [4, 5, 6, 7, 5], []))
        this.weapons.push(new WeaponData("machinegun", 6, [8, 9], [10, 11]))
        this.weapons.push(new WeaponData("chaingun", 12, [12, 13], [14, 15]))

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
        const weapon = this.currentWeapon

        let framesCount
        if (weapon.isAutomatic) {
            framesCount = weapon.loopTextures.length
        } else {
            framesCount = weapon.initTextures.length
        }

        const fireRate = weapon.fireRate * framesCount

        if (this.timeSinceLastUpdate >= 1 / fireRate) {
            this.timeSinceLastUpdate = 0
            if (weapon.initTextures.length > 0 && this.shot) {
                // first textures
                this.frameTextureIndex++
                if (this.frameTextureIndex >= weapon.initTextures.length) {
                    this.frameTextureIndex = 1
                    if (weapon.isAutomatic) {
                        this.setTexture(weapon.loopTextures[this.frameTextureIndex])
                    } else {
                        this.frameTextureIndex = 0
                        this.setTexture(weapon.initTextures[this.frameTextureIndex])
                    }
                    this.shot = false
                } else {
                    this.setTexture(weapon.initTextures[this.frameTextureIndex])
                }
            } else if (weapon.isAutomatic && this.shooting) {
                // loop textures
                this.frameTextureIndex++
                if (this.frameTextureIndex >= weapon.loopTextures.length) {
                    this.frameTextureIndex = 0
                    this.shooting = false
                    this.stoppedShootingIndex = weapon.initTextures.length - 1
                }
                this.setTexture(weapon.loopTextures[this.frameTextureIndex])
            } else {
                // first textures reversed
                if (this.stoppedShootingIndex >= 0) {
                    this.timeSinceLastUpdate = 0
                    this.setTexture(weapon.initTextures[this.stoppedShootingIndex])
                    this.stoppedShootingIndex--
                }
            }
        }
    }

    setTexture(textureNumber: number) {
        if (textureNumber == this.currentTextureNumber) return
        this.currentTextureNumber = textureNumber
        const currentVerticesVec2Array = Vec2.arrayToVec2Array(this.initialTexcoords)
        const texturePos = new Vec2(textureNumber % this.texturesCount.x, Math.floor(textureNumber / this.texturesCount.x)).multiplyByVector(this.textureSize)
        const newVerticesVec2Array = currentVerticesVec2Array.map(vec2 => vec2.multiplyByVector(this.textureSize).add(texturePos))
        this.TEXCOORDS = new Float32Array(Vec2.vec2ArrayToArray(newVerticesVec2Array))
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
}