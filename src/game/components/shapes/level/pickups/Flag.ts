import Camera from '../../../Camera'
import Config from '../../../Config'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import Pickup from './Pickup'
import audio from "../../../../sounds/P_AMMO.wav"
import BetterAudio from '../../../BetterAudio'

export default class Flag extends Pickup {
    textureNumber = 6
    audio = new BetterAudio(audio)
    onCreation() {
        super.onCreation()
        const scale = 0.5
        this.transform.scale = this.transform.scale.multiply(scale)
        this.transform.position.y = -50
    }

    onPickedUp(camera: Camera) {
    }
}