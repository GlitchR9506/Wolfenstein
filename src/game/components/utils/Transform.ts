import { Vec3 } from './Vec3'

export class Transform {
    position = Vec3.zero
    rotation = Vec3.zero
    scale = Vec3.identity
    originTranslation = Vec3.zero

    reset() {
        this.position = Vec3.zero
        this.rotation = Vec3.zero
        this.scale = Vec3.identity
    }
}