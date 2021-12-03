import { Program } from '../../programs/Program'
import { m4, Vec3 } from '../../utils'
import Shape from '../level/Shape'

export default class Crosshair extends Shape {
    readonly VERTICES = new Float32Array([
        1, 1, 0,
        -1, 1, 0,
        -1, -1, 0,
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
    ])

    readonly COLORS = new Uint8Array([
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
    ])

    constructor(gl: WebGLRenderingContext, program: Program) {
        super(gl, program)
        this.transform.scale = Vec3.one.multiply(0.01)
        this.transform.position.z = -2
    }
}