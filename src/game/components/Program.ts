const vertexShaderSource = require('./shaders/VertexShader2D.glsl');
const fragmentShaderSource = require('./shaders/FragmentShader2D.glsl');

export interface ProgramInfo {
    attributes: {
        position: number,
        color: number,
    },
    uniforms: {
        matrix: WebGLUniformLocation
    },
}

export default class Program {
    private readonly program: WebGLProgram
    private readonly gl: WebGLRenderingContext
    info: ProgramInfo
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl

        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.createProgram(gl, vertexShader, fragmentShader);

        this.info = {
            attributes: {
                position: this.attribute("a_position"),
                color: this.attribute("a_color"),
            },
            uniforms: {
                matrix: this.uniform("u_matrix")
            },
        }
    }

    use() {
        this.gl.useProgram(this.program);
    }

    attribute(name: string) {
        return this.gl.getAttribLocation(this.program, name);
    }

    uniform(name: string) {
        return this.gl.getUniformLocation(this.program, name);
    }

    private createShader(gl: WebGLRenderingContext, type: number, source: string) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    private createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
}