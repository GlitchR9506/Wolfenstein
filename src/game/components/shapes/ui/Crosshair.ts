import { Program } from '../../programs/Program'
import { m4, Vec3 } from '../../utils'
import Shape from '../Shape'

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

    bindTransform(matrixLocation: WebGLUniformLocation, viewProjectionMatrix: number[]) {
        let matrix = m4.identity

        // viewProjectionMatrix = m4.identity


        matrix = m4.scale(matrix, this.transform.scale);
        matrix = m4.xRotate(matrix, this.transform.rotation.x);
        matrix = m4.yRotate(matrix, this.transform.rotation.y);
        matrix = m4.zRotate(matrix, this.transform.rotation.z);
        matrix = m4.translate(matrix, this.transform.position);
        matrix = m4.multiply(matrix, viewProjectionMatrix);



        // log('position', m4.getPositionVector(matrix))
        // log('rotation', m4.getRotationVector(matrix))
        // log('scale', m4.getScaleVector(matrix))

        // Set the matrix.
        this.gl.uniformMatrix4fv(matrixLocation, false, matrix);
    }
}