import { degToRad, m4, Vec2, Vec3 } from '../utils'
import Plane from './Plane'
import texture from '../../textures/weapons.png'

export default class Weapon extends Plane {
    static importedTexture = texture

    private textureNumber: number
    type = 'machinegun'
    readonly typeToTextureMap = new Map([
        ['knife', [0, 1, 2, 3]],
        ['pistol', [4, 5, 6, 7]],
        ['machinegun', [8, 9, 10, 11]],
        ['chaingun', [12, 13, 14, 15]],
    ])
    readonly typeToSpeedMap = new Map([
        ['knife', 1 / 2.4],
        ['pistol', 1 / 2.4],
        ['machinegun', 1 / 6],
        ['chaingun', 1 / 12],
    ])

    shoot = false
    timeSinceLastUpdate = 0
    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime
        if (this.timeSinceLastUpdate >= this.typeToSpeedMap.get(this.type) / 4 && this.shoot) {
            this.timeSinceLastUpdate = 0
            const textures = this.typeToTextureMap.get(this.type)
            const index = textures.indexOf(this.textureNumber) + 1
            if (index < textures.length) {
                this.setTexture(textures[index])
            } else {
                this.setTexture(textures[0])
                this.shoot = false
            }
        }
    }
    texturesCount = new Vec2(4, 8)
    get textureSize() {
        return this.texturesCount.map(v => 1 / v)
    }
    setTexture(textureNumber: number) {
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

        this.transform.scale = Vec3.one.multiply(0.5)
        this.transform.position.y = -0.91
        this.setInitialState()
        this.setTexture(this.typeToTextureMap.get(this.type)[0])
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