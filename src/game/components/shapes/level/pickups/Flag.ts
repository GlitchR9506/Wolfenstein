import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import Pickup from './Pickup'

export default class Flag extends Pickup {
    textureNumber = 6

    onPickedUp(camera: Camera) {
    }
}