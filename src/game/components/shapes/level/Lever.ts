import { Vec2, Vec3 } from '../../utils'
import Cuboid from './Cuboid'
import texture from '../../../textures/wall.png'
import Config from '../../Config'
import { Program } from '../../programs/Program'
import Interactable from './Interactable'

export default class Lever extends Cuboid implements Interactable {
    importedTexture = texture
    texturesInLine = 16

    value: string

    constructor(gl: WebGLRenderingContext, program: Program, value: string) {
        super(gl, program)
        this.value = value
        console.log(this.lightTexture)
    }

    canInteract = true

    lightTexture = 101
    pressedTexture = 113

    onCreation() {
        this.transform.scale = Vec3.one.multiply(Config.gridSize)
        this.setTexture(this.lightTexture)
    }

    updateBuffers() {
        super.updateBuffers()
    }

    get darkTexture() {
        return this.lightTexture
    }

    toggle() {
        this.setTexture(this.pressedTexture)
        this.updateBuffers()
    }
}