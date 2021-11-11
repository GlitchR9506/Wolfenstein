import { Vec2, Vec3 } from '../utils'
import Cuboid from './Cuboid'
import texture from '../../textures/wall.png'
import Config from '../Config'

export default class Wall extends Cuboid {
    static importedTexture = texture
    texturesInLine = 4

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale = Vec3.one.multiply(Config.gridSize)
    }

    setInitialState() {
        super.setInitialState()
        // const textureNumber = Math.floor(Math.random() * 4)
        // this.setTexture(textureNumber)
        this.setTexture(0)
    }
}