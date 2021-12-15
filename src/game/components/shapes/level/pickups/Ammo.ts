import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import UI from '../../ui/UI'
import Pickup from './Pickup'
import audio from "../../../../sounds/P_AMMO.wav"
import BetterAudio from '../../../BetterAudio'

export default class Ammo extends Pickup {
    textureNumber = 43
    ammoCount = 4
    audio = new BetterAudio(audio)

    onPickedUp(camera: Camera) {
        UI.instance.ammo += this.ammoCount
        if (UI.instance.weapon == 'knife') {
            UI.instance.weapon = UI.instance.weapons.availableTypes[UI.instance.weapons.availableTypes.length - 1]
        }
    }
}