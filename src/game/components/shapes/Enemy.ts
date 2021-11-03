import Cuboid from './Cuboid'
import texture from '../../textures/enemy.png'
import Shape from './Shape'

export default class Enemy extends Shape {
    VERTICES = new Float32Array([
        // front    
        -0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
    ])

    TEXCOORDS = new Float32Array([
        // front
        0, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        1, 0,
    ])


    static texture = texture
    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale.set(64, 64, 1)
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }
}