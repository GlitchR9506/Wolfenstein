import { log, Vec3 } from '../utils'
import Cuboid from './Cuboid'
import Interactable from './Interactable'

export default class Door extends Cuboid implements Interactable {
    opening = false
    readonly openingSpeed = 20
    readonly openingLength = 50

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale = new Vec3(50, 50, 8)
    }

    update(deltaTime: number) {
        if (!this.opening) return
        if (this.transform.position.x >= this.initialTransform.position.x + this.openingLength) return
        let deltaX = this.openingSpeed * deltaTime
        log('x', this.transform.position.x)
        log('a', this.initialTransform.position.x + this.openingLength)
        if (this.transform.position.x >= this.initialTransform.position.x + this.openingLength) {
            this.transform.position.x = this.initialTransform.position.x + this.openingLength
            this.opening = false
        }
        this.transform.position.x += deltaX
    }

    interact() {
        console.log('interacted')
        this.opening = true
    }
}