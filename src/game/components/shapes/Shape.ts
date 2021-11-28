import { m4, Vec3, Transform } from '../utils'
import { Program, ProgramInfo } from '../programs/Program'

export default class Shape {
    importedTexture: string
    webglTexture: WebGLTexture
    protected readonly gl: WebGLRenderingContext
    protected positionBuffer: WebGLBuffer
    protected colorBuffer: WebGLBuffer
    protected texcoordsBuffer: WebGLBuffer
    protected VERTICES: Float32Array
    protected COLORS: Uint8Array
    protected TEXCOORDS: Float32Array
    protected initialTexcoords: Float32Array
    private firstBufferReady = false
    transform = new Transform()
    initialTransform: Transform
    program: Program

    constructor(gl: WebGLRenderingContext, program: Program) {
        this.gl = gl
        this.program = program
        setTimeout(() => {
            this.updateBuffers()
        })
    }

    get verticesTransformed() {
        return this.verticesVec3Array.map(vec => {
            let a = m4.identity
            a = m4.translate(a, vec.multiplyByVector(this.transform.scale))
            a = m4.rotate(a, this.transform.rotation)
            a = m4.translate(this.transform.matrix, m4.getPositionVector(a))
            return m4.getPositionVector(a)
        })
    }

    get verticesCount() {
        return this.VERTICES.length / 3
    }

    get verticesVec3Array() {
        return Vec3.arrayToVec3Array(this.VERTICES)
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
            (Math.max(...this.xVertices) - Math.min(...this.xVertices)) * this.transform.scale.x,
            (Math.max(...this.yVertices) - Math.min(...this.yVertices)) * this.transform.scale.y,
            (Math.max(...this.zVertices) - Math.min(...this.zVertices)) * this.transform.scale.z,
        )
    }

    get sizeRotated() {
        if (!this.transform.rotation.y) return this.size
        const rotationMatrix = m4.yRotation(this.transform.rotation.y)
        return this.size.transformMat4(rotationMatrix).abs
    }

    get halfSize() {
        return this.size.multiply(0.5)
    }

    get halfSizeRotated() {
        return this.sizeRotated.multiply(0.5)
    }

    texturedWidth = 1
    get texturedSize() {
        return this.size.multiplyByVector(Vec3.right.multiply(this.texturedWidth))
    }

    setInitialState() {
        this.initialTransform = this.transform.clone()
        this.initialTexcoords = this.TEXCOORDS.slice(0)
        this.onCreation()
        this.updateBuffers()
    }

    onCreation() { }

    updateBuffers() {
        this.setPositionBuffer()
        if (this.COLORS) {
            this.setColorBuffer()
        }
        if (this.TEXCOORDS) {
            this.setTexcoordsBuffer()
        }
        this.firstBufferReady = true
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

    bindTexture(texcoordsLocation: number) {
        // Turn on the color attribute
        // console.log(texcoordsLocation)
        this.gl.enableVertexAttribArray(texcoordsLocation);

        // Bind the color buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordsBuffer);

        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        const size = 2;                 // 2 components per iteration
        const type = this.gl.FLOAT;  // the data is 8bit unsigned values
        const normalize = false;         // normalize the data (convert from 0-255 to 0-1)
        const stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;               // start at the beginning of the buffer
        this.gl.vertexAttribPointer(texcoordsLocation, size, type, normalize, stride, offset);
    }

    bindTransform(matrixLocation: WebGLUniformLocation, viewProjectionMatrix: number[]) {
        let matrix = this.transform.matrix
        matrix = m4.multiply(matrix, viewProjectionMatrix);

        // Set the matrix.
        this.gl.uniformMatrix4fv(matrixLocation, false, matrix);
    }

    draw(programInfo: ProgramInfo, viewProjectionMatrix: number[]) {
        if (!this.firstBufferReady) return
        // console.log(programInfo.attributes)
        this.bindGeometry(programInfo.attributes.position)
        if (programInfo.attributes.color) {
            this.bindColors(programInfo.attributes.color)
        }
        if (programInfo.attributes.texcoord) {
            this.bindTexture(programInfo.attributes.texcoord)
        }
        this.bindTransform(programInfo.uniforms.matrix, viewProjectionMatrix)

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.webglTexture);

        this._draw()
    }

    private _draw() {
        const primitiveType = this.gl.TRIANGLES;
        const offset = 0;
        const count = this.verticesCount;
        this.gl.drawArrays(primitiveType, offset, count);
    }

    private setPositionBuffer() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            this.VERTICES,
            this.gl.STATIC_DRAW
        );
    }

    private setColorBuffer() {
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            this.COLORS,
            this.gl.STATIC_DRAW
        );
    }

    private setTexcoordsBuffer() {
        this.texcoordsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordsBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            this.TEXCOORDS,
            this.gl.STATIC_DRAW
        );
    }
}