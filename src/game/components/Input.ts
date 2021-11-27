import { Vec3 } from './utils'

export default class Input {
    static instance = new this

    direction = Vec3.zero
    rotation = 0
    shooting = false
    shot = false
    justShot = false
    interacting = false
    justInteracted = false
    noclip = false

    noclipDisabled = false

    private pressedKeys: string[] = []

    constructor() {
        this.addKeyUpListener()
        this.addKeyDownListener()
    }

    update() {
        this.direction = Vec3.zero
        if (this.isPressed('KeyW') && !this.isPressed('KeyS')) this.direction.z = 1
        if (this.isPressed('KeyS') && !this.isPressed('KeyW')) this.direction.z = -1
        if (this.isPressed('KeyA') && !this.isPressed('KeyD')) this.direction.x = 1
        if (this.isPressed('KeyD') && !this.isPressed('KeyA')) this.direction.x = -1
        this.direction = this.direction.normalize

        this.rotation = 0
        if (this.isPressed('ArrowLeft') && !this.isPressed('ArrowRight')) this.rotation = -1
        if (this.isPressed('ArrowRight') && !this.isPressed('ArrowLeft')) this.rotation = 1

        this.shooting = false
        if (this.isPressed('Space')) this.shooting = true

        this.shot = false
        if (this.isPressed('Space')) {
            if (!this.justShot) {
                this.shot = true
            }
        } else {
            this.justShot = false
        }

        this.interacting = false
        if (this.isPressed('KeyE')) {
            if (!this.justInteracted) {
                this.interacting = true
            }
        } else {
            this.justInteracted = false
        }

        this.noclip = false
        if (!this.noclipDisabled) {
            if (this.isPressed('KeyC')) {
                this.noclip = true
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