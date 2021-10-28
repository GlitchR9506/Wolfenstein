import { degToRad, Vec3 } from './utils'

export default class Movement {
    private pressedKeys: string[] = []
    direction = Vec3.zero
    rotation = 0
    shooting = false
    constructor() {
        this.addKeyUpListener()
        this.addKeyDownListener()
    }

    update() {
        this.direction = Vec3.zero
        if (this.isPressed('KeyW') && !this.isPressed('KeyS')) {
            this.direction.z = 1
        }
        if (this.isPressed('KeyS') && !this.isPressed('KeyW')) {
            this.direction.z = -1
        }
        if (this.isPressed('KeyA') && !this.isPressed('KeyD')) {
            this.direction.x = 1
        }
        if (this.isPressed('KeyD') && !this.isPressed('KeyA')) {
            this.direction.x = -1
        }
        this.direction = this.direction.normalize

        this.rotation = 0
        if (this.isPressed('ArrowLeft') && !this.isPressed('ArrowRight')) {
            this.rotation = -1
        }
        if (this.isPressed('ArrowRight') && !this.isPressed('ArrowLeft')) {
            this.rotation = 1
        }

        if (this.isPressed('Space')) {
            this.shooting = true
        } else {
            this.shooting = false
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
            // console.log(this.pressedKeys)
        })
    }

    private addKeyDownListener() {
        addEventListener('keydown', e => {
            if (!this.pressedKeys.includes(e.code)) {
                this.pressedKeys.push(e.code)
            }
            // console.log(this.pressedKeys)
        })
    }
}