import Camera from '../../../Camera'
import UI from '../../ui/UI'
import Pickup from './Pickup'

export default class PowerUp extends Pickup {
    textureNumber = 56
    onPickedUp(camera: Camera) {
        UI.instance.health = 100
        UI.instance.ammo += 25
        UI.instance.lives++
    }
}