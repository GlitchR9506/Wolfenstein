import { Vec2, Vec3 } from '../../utils'
import Cuboid from './Cuboid'
import texture from '../../../textures/wall.png'
import Config from '../../Config'
import { Program } from '../../programs/Program'

export default class Wall extends Cuboid {
    importedTexture = texture
    texturesInLine = 4

    onCreation() {
        this.transform.scale = Vec3.one.multiply(Config.gridSize)
        this.setTexture(0)
    }
}