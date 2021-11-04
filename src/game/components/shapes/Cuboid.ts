import Shape from './Shape'
import { CuboidBoundingBox } from './CuboidBoundingBox'
import { Vec2 } from '../utils'

export default class Cuboid extends Shape {
    VERTICES = new Float32Array([
        // front    
        -0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,

        // back    
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,

        // left    
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,

        // right    
        0.5, -0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,

        // top    
        -0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,

        // bottom    
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
    ])

    COLORS = new Uint8Array([
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,

        70, 200, 20.50,
        70, 200, 20.50,
        70, 200, 20.50,
        70, 200, 20.50,
        70, 200, 20.50,
        70, 200, 20.50,

        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,

        20.50, 0.500, 70,
        20.50, 0.500, 70,
        20.50, 0.500, 70,
        20.50, 0.500, 70,
        20.50, 0.500, 70,
        20.50, 0.500, 70,

        20.50, 0.560, 70,
        20.50, 0.560, 70,
        20.50, 0.560, 70,
        20.50, 0.560, 70,
        20.50, 0.560, 70,
        20.50, 0.560, 70,
    ])

    TEXCOORDS = new Float32Array([
        // front
        0, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        1, 0,

        // back
        1, 1,
        1, 0,
        0, 0,
        1, 1,
        0, 0,
        0, 1,

        // left
        0, 1,
        1, 1,
        1, 0,
        0, 1,
        1, 0,
        0, 0,

        // right
        1, 1,
        0, 0,
        0, 1,
        1, 1,
        1, 0,
        0, 0,


        // top
        0, 0,
        1, 1,
        1, 0,
        0, 1,
        1, 1,
        0, 0,

        // bottom
        1, 1,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        0, 0,
    ])

    readonly bb = new CuboidBoundingBox(this)
    readonly defaultColors = this.COLORS

    setInitialState() {
        super.setInitialState()
        this.setTexture(0)
    }

    setColor(wall: number, color: number[]) {
        this.COLORS = new Uint8Array([
            ...this.COLORS.slice(0, 3 * 6 * wall),
            color[0], color[1], color[2],
            color[0], color[1], color[2],
            color[0], color[1], color[2],
            color[0], color[1], color[2],
            color[0], color[1], color[2],
            color[0], color[1], color[2],
            ...this.COLORS.slice(3 * 6 * (wall + 1))])
    }

    wallTexcoords(wall: number) {
        return this.TEXCOORDS.slice(2 * 6 * wall, 2 * 6 * (wall + 1))
    }

    initialWallTexcoords(wall: number) {
        return this.initialTexcoords.slice(2 * 6 * wall, 2 * 6 * (wall + 1))
    }

    resetColor() {
        this.COLORS = this.defaultColors
    }

    texturesInLine = 1
    get textureSize() {
        return 1 / this.texturesInLine
    }

    setTexture(textureNumber: number, wallNumber?: number) {
        let newTexcoords = []
        if (wallNumber !== undefined) {
            for (let i = 0; i < 6; i++) {
                if (i == wallNumber) {
                    newTexcoords.push(...this.setTexcoordsToTexture(textureNumber, this.initialWallTexcoords(wallNumber)))
                } else {
                    newTexcoords.push(...this.wallTexcoords(i))
                }
            }
        } else {
            newTexcoords = [...this.setTexcoordsToTexture(textureNumber, this.initialTexcoords)]
        }
        this.TEXCOORDS = new Float32Array(newTexcoords)
    }

    private setTexcoordsToTexture(textureNumber: number, texcoords: Float32Array) {
        let verticesVec2Array = Vec2.arrayToVec2Array(texcoords)
        const texturePos = new Vec2(textureNumber % this.texturesInLine, Math.floor(textureNumber / this.texturesInLine)).multiply(this.textureSize)
        verticesVec2Array = verticesVec2Array.map(vertex => vertex.multiply(this.textureSize).add(texturePos))
        return Vec2.vec2ArrayToArray(verticesVec2Array)
    }
}