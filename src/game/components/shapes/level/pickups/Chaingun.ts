import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import UI from '../../ui/UI'
import Pickup from './Pickup'

export default class Chaingun extends Pickup {
    textureNumber = 48

    onPickedUp(camera: Camera) {
        camera.weapons.availableTypes.push('chaingun')
        UI.instance.weapon = 'chaingun'
    }
}