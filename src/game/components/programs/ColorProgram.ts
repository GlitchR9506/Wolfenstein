import { Program, ProgramInfo } from "./Program";
import vertexShaderSource from '../../shaders/color.vs';
import fragmentShaderSource from '../../shaders/color.fs';

export interface ColorProgramInfo extends ProgramInfo {
    attributes: {
        position: number,
        color: number,
    },
    uniforms: {
        matrix: WebGLUniformLocation
    },
}

export class ColorProgram extends Program {
    info: ColorProgramInfo = {
        attributes: {
            position: this.attribute("a_position"),
            color: this.attribute("a_color"),
        },
        uniforms: {
            matrix: this.uniform("u_matrix")
        },
    }

    constructor(gl: WebGLRenderingContext) {
        super(gl, vertexShaderSource, fragmentShaderSource,)
    }
}