import Cuboid from './Cuboid'
import texture from '../../textures/enemy.png'

export default class Enemy extends Cuboid {
    static texture = texture
    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale.set(50, 50, 1)
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }
}