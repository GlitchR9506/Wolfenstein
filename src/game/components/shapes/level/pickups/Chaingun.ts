import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import UI from '../../ui/UI'
import Pickup from './Pickup'
import audio from "../../../../sounds/P_MGUN.wav"
import BetterAudio from '../../../BetterAudio'

export default class Chaingun extends Pickup {
    textureNumber = 48
    audio = new BetterAudio(audio)

    onPickedUp(camera: Camera) {
        UI.instance.weapons.availableTypes.push('chaingun')
        UI.instance.weapon = 'chaingun'
    }
}