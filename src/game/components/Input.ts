import { Vec3 } from './utils'

export default class Input {
    direction = Vec3.zero
    rotation = 0
    shooting = false
    interacting = false
    justInteracted = false

    movementDisabled = false
    rotationDisabled = false
    shootingDisabled = false
    interactingDisabled = false

    private pressedKeys: string[] = []

    constructor() {
        this.addKeyUpListener()
        this.addKeyDownListener()
    }

    update() {
        this.direction = Vec3.zero
        if (!this.movementDisabled) {
            if (this.isPressed('KeyW') && !this.isPressed('KeyS')) this.direction.z = 1
            if (this.isPressed('KeyS') && !this.isPressed('KeyW')) this.direction.z = -1
            if (this.isPressed('KeyA') && !this.isPressed('KeyD')) this.direction.x = 1
            if (this.isPressed('KeyD') && !this.isPressed('KeyA')) this.direction.x = -1
            this.direction = this.direction.normalize
        }

        this.rotation = 0
        if (!this.rotationDisabled) {
            if (this.isPressed('ArrowLeft') && !this.isPressed('ArrowRight')) this.rotation = -1
            if (this.isPressed('ArrowRight') && !this.isPressed('ArrowLeft')) this.rotation = 1
        }

        this.shooting = false
        if (!this.shootingDisabled) {
            if (this.isPressed('Space')) this.shooting = true
        }

        this.interacting = false
        if (!this.interactingDisabled) {
            if (this.isPressed('KeyE')) {
                if (!this.justInteracted) {
                    this.interacting = true
                }
            } else {
                this.justInteracted = false
            }
        }
    }

    private isPressed(key: string) {
        return this.pressedKeys.includes(key)
    }

    private addKeyUpListener() {
        addEventListener('keyup', e => {
            if (this.pressedKeys.includes(e.code)) {
                this.pressedKeys = this.pressedKeys.filter(key => key != e.code)
            }
        })
    }

    private addKeyDownListener() {
        addEventListener('keydown', e => {
            if (!this.pressedKeys.includes(e.code)) {
                this.pressedKeys.push(e.code)
            }
        })
    }
}