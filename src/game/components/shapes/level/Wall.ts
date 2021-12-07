import { Vec2, Vec3 } from '../../utils'
import Cuboid from './Cuboid'
import texture from '../../../textures/wall.png'
import Config from '../../Config'
import { Program } from '../../programs/Program'

export default class Wall extends Cuboid {
    importedTexture = texture
    texturesInLine = 16

    value: string

    constructor(gl: WebGLRenderingContext, program: Program, value: string) {
        super(gl, program)
        this.value = value
    }

    nearDoorLightTexture = 106
    nearDoorDarkTexture = 107

    onCreation() {
        this.transform.scale = Vec3.one.multiply(Config.gridSize)
        this.setTexture(this.lightTexture)
        this.setTexture(this.darkTexture, 2)
        this.setTexture(this.darkTexture, 3)
    }

    updateBuffers() {
        super.updateBuffers()
    }

    get textureColor() {
        for (let color of ['gray', 'blue', 'brown']) {
            if (this.value.toLowerCase().includes(color)) {
                return color
            }
        }
        return 'gray'
    }

    get textureName() {
        for (let lastLetter of ['F', 'E', 'H', 'B', 'S', 'E', 'H']) {
            if (this.value.substr(-1) == lastLetter) {
                return lastLetter
            }
        }
        return null
    }

    get lightTexture() {
        switch (this.textureColor) {
            case 'gray':
                switch (this.textureName) {
                    case 'F': return 4      //flag
                    case 'H': return 16     //hitler
                    case 'E': return 20     //eagle
                    default: return 0
                }
            case 'blue':
                switch (this.textureName) {
                    case 'B': return 18    //bars
                    case 'S': return 32     //skeleton bars
                    default: return 34
                }
            case 'brown':
                switch (this.textureName) {
                    case 'E': return 48     //eagle
                    case 'H': return 50     //hitler
                    default: return 52
                }
        }
    }

    get darkTexture() {
        return this.lightTexture + 1
    }
}