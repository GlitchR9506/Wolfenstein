import { Vec2, Vec3 } from '../utils'
import Cuboid from './Cuboid'
import texture from '../../textures/wall.png'

export default class Wall extends Cuboid {
    static texture = texture
    texturesInLine = 4

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale = Vec3.one.multiply(64)
    }

    setInitialState() {
        super.setInitialState()
        // const textureNumber = Math.floor(Math.random() * 4)
        // this.setTexture(textureNumber)
        this.setTexture(0)
    }
}