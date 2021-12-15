import BetterAudio from '../../../BetterAudio'
import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import UI from '../../ui/UI'
import Pickup from './Pickup'

export default abstract class HealthItem extends Pickup {
    abstract healthRestored: number
    abstract audio: BetterAudio

    onPickedUp(camera: Camera) {
        UI.instance.health += this.healthRestored
        if (UI.instance.health > 100) {
            UI.instance.health = 100
        }
    }

    canBePickedUp(camera: Camera) {
        return UI.instance.health < 100
    }
}