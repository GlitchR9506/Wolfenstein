import Cuboid from './Cuboid'

export default class Enemy extends Cuboid {
    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale.set(50, 50, 1)
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }
}