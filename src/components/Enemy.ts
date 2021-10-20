import { m4, Vec3, degToRad } from './utils/index'
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