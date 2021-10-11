import { Vec3, degToRad } from './utils'
import m4 from './m4'
import Shape from './Shape'
import Cube from './Cube'

export default class Enemy extends Cube {
    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale.set(50, 50, 1)
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }
}