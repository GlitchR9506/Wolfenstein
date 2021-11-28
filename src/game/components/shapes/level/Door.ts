import { log, m4, Vec3 } from '../../utils'
import Cuboid from './Cuboid'
import Interactable from './Interactable'
import texture from '../../../textures/door.png'
import Config from '../../Config'
import { Program } from '../../programs/Program'


export default class Door extends Cuboid implements Interactable {
    importedTexture = texture

    private opening = false
    private closing = false

    private readonly openingSpeed = Config.gridSize / 2
    private readonly openingLength = Config.gridSize

    private readonly hiddenInWallScaleCorrection = new Vec3(0.1, 0.1, 0)

    private positionFinal: Vec3

    TEXCOORDS = new Float32Array([
        // front
        0, 1,
        0.5, 0,
        0, 0,
        0, 1,
        0.5, 1,
        0.5, 0,

        // back
        0, 1,
        0, 0,
        0.5, 0,
        0, 1,
        0.5, 0,
        0.5, 1,

        // left
        0.5, 1,
        0.546875, 1,
        0.546875, 0,
        0.5, 1,
        0.546875, 0,
        0.5, 0,

        // right
        0.5, 1,
        0.546875, 0,
        0.546875, 1,
        0.5, 1,
        0.5, 0,
        0.546875, 0,

        // top
        0.5, 1,
        0.546875, 0,
        0.5, 0,
        0.546875, 1,
        0.546875, 0,
        0.5, 1,

        // bottom
        0.5, 1,
        0.546875, 1,
        0.5, 0,
        0.5, 0,
        0.546875, 1,
        0.546875, 0,
    ])

    onCreation() {
        this.transform.scale = new Vec3(Config.gridSize, Config.gridSize, Config.gridSize * 6 / 64)
        const translationFinal = new Vec3(this.openingLength, 0, 0)
        let mFinal = m4.identity
        mFinal = m4.translate(mFinal, translationFinal)
        mFinal = m4.yRotate(mFinal, this.transform.rotation.y)
        const positionDeltaFinal = m4.getPositionVector(mFinal)
        this.positionFinal = this.initialTransform.position.add(positionDeltaFinal)
    }

    update(deltaTime: number) {
        const translation = new Vec3(this.openingSpeed * deltaTime, 0, 0)
        let m = m4.identity
        m = m4.translate(m, translation)
        m = m4.yRotate(m, this.transform.rotation.y)
        const positionDelta = m4.getPositionVector(m)

        if (this.opening) {
            if (this.transform.position.equals(this.positionFinal)) {
                this.opening = false
                if (this.initialTransform.scale.equals(this.transform.scale)) {
                    this.transform.scale = this.transform.scale.substract(this.hiddenInWallScaleCorrection)
                }
            } else {
                if (this.positionFinal.substract(this.transform.position).isLess(positionDelta)) {
                    this.transform.position = this.positionFinal.clone()
                } else {
                    this.transform.position = this.transform.position.add(positionDelta)
                }
            }
        } else if (this.closing) {
            if (this.transform.position.equals(this.initialTransform.position)) {
                this.closing = false
            } else {
                if (this.transform.position.substract(this.initialTransform.position).isLess(positionDelta)) {
                    this.transform.position = this.initialTransform.position.clone()
                } else {
                    this.transform.position = this.transform.position.substract(positionDelta)
                }
            }
        }
    }

    get closed() {
        return this.transform.position.equals(this.initialTransform.position)
    }

    get opened() {
        return this.transform.position.equals(this.positionFinal)
    }

    interact() {
        if (this.closed || this.closing) {
            this.closing = false
            this.opening = true
        } else if (this.opened || this.opening) {
            if (this.transform.scale.add(this.hiddenInWallScaleCorrection).equals(this.initialTransform.scale)) {
                this.transform.scale = this.transform.scale.add(this.hiddenInWallScaleCorrection)
            }
            this.opening = false
            this.closing = true
        }
    }
}