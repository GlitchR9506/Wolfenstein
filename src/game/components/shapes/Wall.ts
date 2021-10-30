import { Vec3 } from '../utils'
import Cuboid from './Cuboid'

export default class Wall extends Cuboid {
    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale = Vec3.one.multiply(50)
    }
}