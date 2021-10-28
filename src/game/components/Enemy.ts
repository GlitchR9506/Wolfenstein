import { m4, Vec3, degToRad } from './utils/'
import Shape from './Shape'
import Wall from './Wall'

export default class Enemy extends Wall {
    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale.set(50, 50, 1)
        // this.transform.scale.set(50, 50, 50)
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }
}