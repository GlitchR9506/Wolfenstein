import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import UI from '../../ui/UI'
import Pickup from './Pickup'

export default class Machinegun extends Pickup {
    textureNumber = 44

    onPickedUp(camera: Camera) {
        camera.weapons.availableTypes.push('machinegun')
        camera.weapons.type = 'machinegun'
        UI.instance.weapon = 'chaingun'
    }
}