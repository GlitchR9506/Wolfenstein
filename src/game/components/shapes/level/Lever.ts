import { Vec2, Vec3 } from '../../utils'
import Cuboid from './Cuboid'
import texture from '../../../textures/wall.png'
import Config from '../../Config'
import { Program } from '../../programs/Program'
import Interactable from './Interactable'
import UI from '../ui/UI'
import BetterAudio from '../../BetterAudio'
import audio from "../../../sounds/WSND0030.wav"

export default class Lever extends Cuboid implements Interactable {
    importedTexture = texture
    texturesInLine = 16
    audio = new BetterAudio(audio)
    value: string

    constructor(gl: WebGLRenderingContext, program: Program, value: string) {
        super(gl, program)
        this.value = value
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
        if (UI.instance.state != 'end') {
            this.audio.play()
            this.setTexture(this.pressedTexture)
            UI.instance.state = 'end'
            UI.instance.levelEnd.getTime()
            UI.instance.endTime = new Date()
            this.updateBuffers()
        }
    }
}