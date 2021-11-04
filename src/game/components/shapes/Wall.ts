import { Vec2, Vec3 } from '../utils'
import Cuboid from './Cuboid'
import texture from '../../textures/wall.png'

export default class Wall extends Cuboid {
    static texture = texture
    texturesInLine = 4
    textureSize = 1 / this.texturesInLine

    constructor(gl: WebGLRenderingContext) {
        super(gl)




        // let newTexcoords = []
        // for (let wall of [0, 1, 2, 3, 4, 5]) {
        //     let verticesVec2Array = Vec2.arrayToVec2Array(this.wallTexcoords(wall))
        //     const texturePos = new Vec2(textureNumber % this.texturesInLine, Math.floor(textureNumber / this.texturesInLine)).multiply(this.textureSize)
        //     verticesVec2Array = verticesVec2Array.map(vertex => vertex.multiply(this.textureSize).add(texturePos))
        //     newTexcoords.push(...Vec2.vec2ArrayToArray(verticesVec2Array))
        // }
        // this.TEXCOORDS = new Float32Array(newTexcoords)

        this.transform.scale = Vec3.one.multiply(64)
    }

    onInitEnd() {
        super.onInitEnd()
        // const textureNumber = Math.floor(Math.random() * 4)
        // this.setTexture(textureNumber)
        this.setTexture(0)
    }

    setTexture(textureNumber: number, wall?: number) {
        let verticesVec2Array
        if (wall !== undefined) {
            let newTexcoords = []

            for (let i = 0; i < wall; i++) {
                newTexcoords.push(...this.wallTexcoords(i))
            }

            verticesVec2Array = Vec2.arrayToVec2Array(this.initialWallTexcoords(wall))
            const texturePos = new Vec2(textureNumber % this.texturesInLine, Math.floor(textureNumber / this.texturesInLine)).multiply(this.textureSize)
            verticesVec2Array = verticesVec2Array.map(vertex => vertex.multiply(this.textureSize).add(texturePos))
            newTexcoords.push(...Vec2.vec2ArrayToArray(verticesVec2Array))

            for (let i = wall + 1; i <= 6; i++) {
                newTexcoords.push(...this.wallTexcoords(i))
            }

            this.TEXCOORDS = new Float32Array(newTexcoords)
        } else {
            verticesVec2Array = Vec2.arrayToVec2Array(this.initialTexcoords)
            const texturePos = new Vec2(textureNumber % this.texturesInLine, Math.floor(textureNumber / this.texturesInLine)).multiply(this.textureSize)
            verticesVec2Array = verticesVec2Array.map(vertex => vertex.multiply(this.textureSize).add(texturePos))
            this.TEXCOORDS = new Float32Array(Vec2.vec2ArrayToArray(verticesVec2Array))
        }
    }
}