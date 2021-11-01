import { Vec3 } from '../utils'
import Cuboid from './Cuboid'
import texture from '../../textures/wall.png'

export default class Wall extends Cuboid {
    static texture = texture
    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale = Vec3.one.multiply(50)
    }
}