import { Vec2, Vec3 } from '../../utils'
import Cuboid from './Cuboid'
import texture from '../../../textures/wall.png'
import Config from '../../Config'
import { Program } from '../../programs/Program'

type type = 'gray' | 'blue' | 'brown'

export default class Wall extends Cuboid {
    importedTexture = texture
    texturesInLine = 16

    type: type

    constructor(gl: WebGLRenderingContext, program: Program, type: type) {
        super(gl, program)
        this.type = type
    }

    // 34 35 52 53
    // lightTexture = 0
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

    get lightTexture() {
        switch (this.type) {
            case 'gray': return 0
            case 'blue': return 34
            case 'brown': return 52
        }
    }

    get darkTexture() {
        return this.lightTexture + 1
    }
}