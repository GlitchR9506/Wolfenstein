import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import UI from '../../ui/UI'
import Pickup from './Pickup'
import audio from "../../../../sounds/P_MGUN.wav"
import BetterAudio from '../../../BetterAudio'

export default class Machinegun extends Pickup {
    textureNumber = 44
    audio = new BetterAudio(audio)

    onPickedUp(camera: Camera) {
        camera.weapons.availableTypes.push('machinegun')
        UI.instance.weapon = 'machinegun'
    }
}