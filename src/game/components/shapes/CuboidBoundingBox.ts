import Shape from "./Shape";
import { log, Transform, Vec3 } from "../utils";

export class CuboidBoundingBox {
    readonly shape: Shape
    readonly transform: Transform

    constructor(shape: Shape) {
        this.shape = shape
        this.transform = shape.transform
    }

    get vertices() {
        return this.shape.verticesTransformed
    }

    get size() {
        return this.shape.size
    }

    get halfSize() {
        return this.shape.halfSize
    }

    // only non rotated cuboid
    get negativeCorner() {
        return this.transform.position.substract(this.halfSize)
    }

    // only non rotated cuboid
    get positiveCorner() {
        return this.transform.position.add(this.halfSize)
    }

    // only non rotated cuboid
    isColliding(v: Vec3) {
        const pos = this.positiveCorner
        const neg = this.negativeCorner
        return neg.x <= v.x && v.x <= pos.x && neg.z <= v.z && v.z <= pos.z
    }

    // only non rotated cuboid
    pointSide(v: Vec3) {
        let checkingPoint = this.transform.position
        const diff = checkingPoint.substract(v)

        let collisionSide = Vec3.zero
        if (diff.x > this.halfSize.x) {
            collisionSide.x = -1
        }
        if (diff.x < -this.halfSize.x) {
            collisionSide.x = 1
        }
        if (diff.z > this.halfSize.z) {
            collisionSide.z = -1
        }
        if (diff.z < -this.halfSize.z) {
            collisionSide.z = 1
        }
        if (collisionSide.x && collisionSide.z) {
            if (Math.abs(diff.x) > Math.abs(diff.z)) {
                collisionSide.z = 0
            } else {
                collisionSide.x = 0
            }
        }
        log('diff.x', diff.x)
        log('diff.z', diff.z)
        log('collisionSide', collisionSide)
        return collisionSide
    }
}