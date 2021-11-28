import { degToRad, Vec2, Vec3 } from '../../../utils'
import HealthItem from './HealthItem'

export default class Food extends HealthItem {
    healthRestored = 10
    textureNumber = 41
}