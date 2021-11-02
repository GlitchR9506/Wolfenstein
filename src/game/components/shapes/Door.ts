import { log, Vec3 } from '../utils'
import Cuboid from './Cuboid'
import Interactable from './Interactable'
import texture from '../../textures/door.png'


export default class Door extends Cuboid implements Interactable {
    static texture = texture

    private opening = false
    private closing = false

    private readonly openingSpeed = 20
    private readonly openingLength = 50

    private readonly hiddenInWallScaleCorrection = Vec3.one

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale = new Vec3(50, 50, 8)
    }

    update(deltaTime: number) {
        if (this.opening) {
            if (this.transform.position.x >= this.initialTransform.position.x + this.openingLength) {
                this.transform.position.x = this.initialTransform.position.x + this.openingLength
                this.opening = false
                this.transform.scale = this.transform.scale.substract(this.hiddenInWallScaleCorrection)
            } else {
                this.transform.position.x += this.openingSpeed * deltaTime
            }
        } else if (this.closing) {
            if (this.transform.position.x <= this.initialTransform.position.x) {
                this.transform.position.x = this.initialTransform.position.x
                this.closing = false
            } else {
                this.transform.position.x -= this.openingSpeed * deltaTime
            }
        }
    }

    get closed() {
        return this.transform.position.x == this.initialTransform.position.x
    }

    get opened() {
        return this.transform.position.x == this.initialTransform.position.x + this.openingLength
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