import { Vec2, Vec3 } from '../../utils'
import Cuboid from './Cuboid'
import texture from '../../../textures/wall.png'
import Config from '../../Config'

export default class Wall extends Cuboid {
    importedTexture = texture
    texturesInLine = 16

    lightTexture = 0
    darkTexture = 1
    nearDoorLightTexture = 106
    nearDoorDarkTexture = 107

    onCreation() {
        this.transform.scale = Vec3.one.multiply(Config.gridSize)
        this.setTexture(this.lightTexture)
        this.setTexture(this.darkTexture, 2)
        this.setTexture(this.darkTexture, 3)
    }
}