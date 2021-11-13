import { degToRad, m4, Vec2, Vec3 } from '../utils'
import Plane from './Plane'
import texture from '../../textures/weapons.png'

export default class Weapon extends Plane {
    static importedTexture = texture

    private textureNumber: number
    type = 'chaingun'
    readonly typeToTextureMap = new Map([
        ['knife', [[0, 1, 2, 3, 2, 1], []]],
        ['pistol', [[4, 5, 6, 7, 5], []]],
        ['machinegun', [[8, 9], [10, 11]]],
        ['chaingun', [[12, 13], [14, 15]]],
    ])
    readonly typeToFireRateMap = new Map([
        ['knife', 2.4],
        ['pistol', 2.4],
        ['machinegun', 6],
        ['chaingun', 12],
    ])

    shooting = false
    shot = false
    timeSinceLastUpdate = 0
    textureIndex = 0
    stoppedShootingIndex = 0
    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime
        const textures = this.typeToTextureMap.get(this.type)
        const firstTextures = textures[0]
        const loopTextures = textures[1]
        let framesCount
        if (loopTextures.length == 0) {
            framesCount = firstTextures.length
        } else {
            framesCount = loopTextures.length
        }
        const fireRate = this.typeToFireRateMap.get(this.type) * framesCount
        if (this.timeSinceLastUpdate >= 1 / fireRate) {
            this.timeSinceLastUpdate = 0
            if (firstTextures.length > 0 && this.shot) {
                // first textures
                this.textureIndex++
                if (this.textureIndex >= firstTextures.length) {
                    this.textureIndex = 1
                    if (loopTextures.length > 0) {
                        this.setTexture(loopTextures[this.textureIndex])
                    } else {
                        this.textureIndex = 0
                        this.setTexture(firstTextures[this.textureIndex])
                    }
                    this.shot = false
                } else {
                    this.setTexture(firstTextures[this.textureIndex])
                }
            } else if (loopTextures.length > 0 && this.shooting) {
                // loop textures
                this.textureIndex++
                if (this.textureIndex >= loopTextures.length) {
                    this.textureIndex = 0
                    this.shooting = false
                    this.setTexture(loopTextures[this.textureIndex])
                    this.stoppedShootingIndex = firstTextures.length - 1
                } else {
                    this.setTexture(loopTextures[this.textureIndex])
                }
            } else {
                // first textures reversed
                if (this.stoppedShootingIndex >= 0) {
                    this.timeSinceLastUpdate = 0
                    this.setTexture(firstTextures[this.stoppedShootingIndex])
                    this.stoppedShootingIndex--
                }

            }
        }
    }
    texturesCount = new Vec2(4, 8)
    get textureSize() {
        return this.texturesCount.map(v => 1 / v)
    }
    setTexture(textureNumber: number) {
        console.log(textureNumber)
        if (textureNumber == this.textureNumber) return
        this.textureNumber = textureNumber
        let verticesVec2Array = Vec2.arrayToVec2Array(this.initialTexcoords)
        let texturePos = new Vec2(textureNumber % this.texturesCount.x, Math.floor(textureNumber / this.texturesCount.x)).multiplyByVector(this.textureSize)
        verticesVec2Array = verticesVec2Array.map(vec2 => vec2.multiplyByVector(this.textureSize).add(texturePos))
        this.TEXCOORDS = new Float32Array(Vec2.vec2ArrayToArray(verticesVec2Array))
    }

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.position.z = -2
        this.transform.rotation.x = degToRad(90)

        this.transform.scale = Vec3.one.multiply(1)
        this.transform.position.y = -0.66
        this.setInitialState()
        this.setTexture(this.typeToTextureMap.get(this.type)[0][0])
    }

    bindTransform(matrixLocation: WebGLUniformLocation, viewProjectionMatrix: number[]) {
        let matrix = m4.identity

        // viewProjectionMatrix = m4.identity


        matrix = m4.scale(matrix, this.transform.scale);
        matrix = m4.xRotate(matrix, this.transform.rotation.x);
        matrix = m4.yRotate(matrix, this.transform.rotation.y);
        matrix = m4.zRotate(matrix, this.transform.rotation.z);
        matrix = m4.translate(matrix, this.transform.position);
        matrix = m4.multiply(matrix, viewProjectionMatrix);



        // log('position', m4.getPositionVector(matrix))
        // log('rotation', m4.getRotationVector(matrix))
        // log('scale', m4.getScaleVector(matrix))

        // Set the matrix.
        this.gl.uniformMatrix4fv(matrixLocation, false, matrix);
    }
}