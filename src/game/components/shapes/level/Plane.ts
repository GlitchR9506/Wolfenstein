import texture from '../../../textures/uv-test.png'
import { hexToRgb, Vec3 } from '../../utils'
import Shape from './Shape'
import Config from '../../Config'
import { Program } from '../../programs/Program'

export default class Plane extends Shape {
    VERTICES = new Float32Array([
        0.5, 0, 0.5,
        -0.5, 0, -0.5,
        -0.5, 0, 0.5,
        0.5, 0, -0.5,
        -0.5, 0, -0.5,
        0.5, 0, 0.5,
    ])

    TEXCOORDS = new Float32Array([
        1, 1,
        0, 0,
        0, 1,
        1, 0,
        0, 0,
        1, 1,
    ])

    COLORS = new Uint8Array([
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
    ])

    importedTexture = texture

    constructor(gl: WebGLRenderingContext, program: Program) {
        super(gl, program)
        this.transform.scale.set(Config.gridSize, 1, Config.gridSize)
    }

    setColor(color: string) {
        let colors = Vec3.arrayToVec3Array(this.COLORS)
        colors = colors.map(c => hexToRgb(color))
        this.COLORS = new Uint8Array(Vec3.vec3ArrayToArray(colors))
    }
}