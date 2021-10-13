import { Vec3, degToRad, Transform, log } from './utils'
import m4 from './m4'
import { ProgramInfo } from './Program'

export default class Shape {
    protected readonly gl: WebGLRenderingContext
    protected positionBuffer: WebGLBuffer
    protected colorBuffer: WebGLBuffer
    protected VERTICES: Float32Array
    protected COLORS: Uint8Array
    protected originTranslationCorrection = Vec3.zero
    transform: Transform = {
        position: Vec3.zero,
        rotation: Vec3.zero,
        scale: Vec3.identity,
    }

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
    }

    get verticesCount() {
        return this.VERTICES.length / 3
    }


    get xVertices() {
        return this.VERTICES.filter((_, index) => index % 3 == 0)
    }

    get yVertices() {
        return this.VERTICES.filter((_, index) => index % 3 == 1)
    }

    get zVertices() {
        return this.VERTICES.filter((_, index) => index % 3 == 2)
    }

    get size() {
        return new Vec3(
            (Math.max(...this.xVertices) - Math.min(...this.xVertices)),
            (Math.max(...this.yVertices) - Math.min(...this.yVertices)),
            (Math.max(...this.zVertices) - Math.min(...this.zVertices)),
        )
    }

    get originTranslation() {
        let translation = this.size.multiply(-0.5)
        if (this.originTranslationCorrection.x) {
            translation.x = this.originTranslationCorrection.x
        }
        if (this.originTranslationCorrection.y) {
            translation.z = this.originTranslationCorrection.y
        }
        if (this.originTranslationCorrection.z) {
            translation.z = this.originTranslationCorrection.z
        }
        return translation
    }

    setBuffers() {
        this.setPositionBuffer()
        this.setColorBuffer()
    }

    bindGeometry(positionLocation: number) {
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        const size = 3;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
    }

    bindColors(colorLocation: number) {
        // Turn on the color attribute
        this.gl.enableVertexAttribArray(colorLocation);

        // Bind the color buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);

        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        const size = 3;                 // 3 components per iteration
        const type = this.gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
        const normalize = true;         // normalize the data (convert from 0-255 to 0-1)
        const stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;               // start at the beginning of the buffer
        this.gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

    }

    bindTransform(matrixLocation: WebGLUniformLocation, viewProjectionMatrix: number[]) {
        let matrix

        matrix = m4.translate(viewProjectionMatrix, this.transform.position);

        matrix = m4.xRotate(matrix, this.transform.rotation.x);
        matrix = m4.yRotate(matrix, this.transform.rotation.y);
        matrix = m4.zRotate(matrix, this.transform.rotation.z);

        matrix = m4.scale(matrix, this.transform.scale.x, this.transform.scale.y, this.transform.scale.z);

        // Set the matrix.
        this.gl.uniformMatrix4fv(matrixLocation, false, matrix);
    }

    draw(programInfo: ProgramInfo, viewProjectionMatrix: number[]) {
        this.bindGeometry(programInfo.attributes.position)
        this.bindColors(programInfo.attributes.color)
        this.bindTransform(programInfo.uniforms.matrix, viewProjectionMatrix)
        this._draw()
    }

    _draw() {
        const primitiveType = this.gl.TRIANGLES;
        const offset = 0;
        const count = this.verticesCount;
        this.gl.drawArrays(primitiveType, offset, count);
    }

    private setPositionBuffer() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.setGeometry()
    }

    private setColorBuffer() {
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.setColors()
    }

    private setGeometry() {
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            this.VERTICES,
            this.gl.STATIC_DRAW);
    }

    private setColors() {
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            this.COLORS,
            this.gl.STATIC_DRAW);
    }
}