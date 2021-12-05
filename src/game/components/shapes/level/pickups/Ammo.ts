import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import UI from '../../ui/UI'
import Pickup from './Pickup'

export default class Ammo extends Pickup {
    textureNumber = 43
    ammoCount = 4

    onPickedUp(camera: Camera) {
        camera.weapons.ammo += this.ammoCount
        UI.instance.ammo = camera.weapons.ammo
    }
}