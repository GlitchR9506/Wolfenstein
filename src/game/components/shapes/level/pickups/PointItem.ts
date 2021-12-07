import Camera from '../../../Camera'
import UI from '../../ui/UI'
import Pickup from './Pickup'

export default abstract class PointItem extends Pickup {
    abstract textureNumber: number
    abstract givenScore: number

    onPickedUp(camera: Camera) {
        UI.instance.score += this.givenScore
    }
}