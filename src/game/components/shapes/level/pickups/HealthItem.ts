import Camera from '../../../Camera'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import Pickup from './Pickup'

export default abstract class HealthItem extends Pickup {
    abstract healthRestored: number

    onPickedUp(camera: Camera) {
        camera.hp += this.healthRestored
        if (camera.hp > 100) {
            camera.hp = 100
        }
    }

    canBePickedUp(camera: Camera) {
        return camera.hp < 100
    }
}