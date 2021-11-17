import { degToRad, m4, Vec2, Vec3 } from '../utils'
import Plane from './Plane'
import Weapon from './Weapon'
import texture from '../../textures/weapons.png'

export default class Weapons extends Plane {
    static importedTexture = texture

    type = 'chaingun'

    private weapons: Weapon[] = []
    private texturesCount = new Vec2(4, 8)
    private currentTextureNumber: number

    private timeSinceLastUpdate = 0

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.position.z = -2
        this.transform.rotation.x = degToRad(90)
        this.transform.scale = Vec3.one.multiply(1)
        this.transform.position.y = -0.66
        this.setInitialState()

        this.weapons.push(new Weapon("knife", 2.4, [0, 1, 2, 3, 2, 1], []))
        this.weapons.push(new Weapon("pistol", 2.4, [4, 5, 6, 7, 5], []))
        this.weapons.push(new Weapon("machinegun", 6, [8, 9], [10, 11]))
        this.weapons.push(new Weapon("chaingun", 12, [12, 13], [14, 15]))

        this.setTexture(this.currentWeapon.initTextures[0])
    }

    get textureSize() {
        return this.texturesCount.map(v => 1 / v)
    }

    get currentWeapon() {
        return this.weapons.find(weapon => weapon.type == this.type)
    }

    shoot() {
        if (!this.currentWeapon.isAutomatic) {
            this.currentWeapon.willShoot = true
        }
    }

    setShooting(shooting: boolean) {
        if (this.currentWeapon.isAutomatic) {
            this.currentWeapon.shooting = shooting
        }
    }

    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime

        const weapon = this.currentWeapon
        const frameTime = 1 / (weapon.fireRate * weapon.framesCount)

        if (this.timeSinceLastUpdate >= frameTime) {
            this.timeSinceLastUpdate = 0
            this.setTexture(weapon.getNextTexture())
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