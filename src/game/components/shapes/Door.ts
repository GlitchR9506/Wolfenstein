import { log, m4, Vec3 } from '../utils'
import Cuboid from './Cuboid'
import Interactable from './Interactable'
import texture from '../../textures/door.png'


export default class Door extends Cuboid implements Interactable {
    static texture = texture

    private opening = false
    private closing = false

    private readonly openingSpeed = 20
    private readonly openingLength = 50

    private readonly hiddenInWallScaleCorrection = new Vec3(0.1, 0.1, 0)

    private positionFinal: Vec3

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale = new Vec3(50, 50, 8)

    }

    setInitialTransform() {
        super.setInitialTransform()
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
                this.transform.scale = this.transform.scale.substract(this.hiddenInWallScaleCorrection)
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
        if (this.closed && !this.opening) {
            this.opening = true
        }
        if (this.opened && !this.closing) {
            this.transform.scale = this.transform.scale.add(this.hiddenInWallScaleCorrection)
            this.closing = true
        }
    }
}