import { Vec3 } from '.'
import { m4 } from '.'

export class Transform {
    position = Vec3.zero
    rotation = Vec3.zero
    scale = Vec3.one
    originTranslation = Vec3.zero

    reset() {
        this.position = Vec3.zero
        this.rotation = Vec3.zero
        this.scale = Vec3.one
    }

    get matrix() {
        let matrix = m4.identity

        matrix = m4.scale(matrix, this.scale);

        matrix = m4.xRotate(matrix, this.rotation.x);
        matrix = m4.yRotate(matrix, this.rotation.y);
        matrix = m4.zRotate(matrix, this.rotation.z);

        const position = this.position.add(this.originTranslation)
        matrix = m4.translate(matrix, position);

        return matrix
    }

    clone() {
        const transform = new Transform()
        transform.position = this.position.clone()
        transform.rotation = this.rotation.clone()
        transform.scale = this.scale.clone()
        return transform
    }
}