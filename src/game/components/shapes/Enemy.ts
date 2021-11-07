import texture from '../../textures/guard.png'
import { degToRad, Vec2 } from '../utils'
import Plane from './Plane'

export default class Enemy extends Plane {
    static importedTexture = texture

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.rotation.x = degToRad(90)
    }

    private textureNumber: number
    state = 'walking'
    readonly stateToTextureMap = new Map([
        ['shooting', [0, 4, 8]],
        ['walking', [1, 5, 9, 13]],
        ['dying', [2, 6, 10, 14]],
        ['dead', [14]],
    ])
    readonly frameTime = 0.2

    timeSinceLastUpdate = 0
    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime
        if (this.timeSinceLastUpdate > this.frameTime) {
            this.timeSinceLastUpdate = 0
            const textures = this.stateToTextureMap.get(this.state)
            const index = textures.indexOf(this.textureNumber) + 1
            if (index < textures.length) {
                this.setTexture(textures[index])
            } else {
                if (this.state == 'dying') {
                    this.state = 'dead'
                } else {
                    this.setTexture(textures[0])
                }
            }
        }
    }

    hp = 100
    damage(value: number) {
        this.hp -= value
        if (this.hp <= 0) {
            this.hp = 0
            this.state = 'dying'
        }
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }

    get texturedSize() {
        let size = this.size
        size.x *= 299 / 512
        return size
    }

    texturesInLine = 4
    get textureSize() {
        return 1 / this.texturesInLine
    }

    setTexture(textureNumber: number) {
        if (textureNumber == this.textureNumber) return
        this.textureNumber = textureNumber
        let verticesVec2Array = Vec2.arrayToVec2Array(this.initialTexcoords)
        const texturePos = new Vec2(textureNumber % this.texturesInLine, Math.floor(textureNumber / this.texturesInLine)).multiply(this.textureSize)
        verticesVec2Array = verticesVec2Array.map(vertex => vertex.multiply(this.textureSize).add(texturePos))
        const a = Vec2.vec2ArrayToArray(verticesVec2Array)
        this.TEXCOORDS = new Float32Array(a)
    }
}