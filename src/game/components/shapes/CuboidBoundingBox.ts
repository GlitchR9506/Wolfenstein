import Shape from "./Shape";
import { log, m4, Transform, Vec3 } from "../utils";

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

    get sizeRotated() {
        return this.shape.sizeRotated
    }

    get halfSize() {
        return this.shape.halfSize
    }

    get halfSizeRotated() {
        return this.shape.halfSizeRotated
    }

    // only 90*x rotated cuboid
    get negativeCorner() {
        return this.transform.position.substract(this.halfSize)
    }

    get negativeCornerRotated() {
        return this.transform.position.substract(this.halfSizeRotated)
    }

    // only 90*x rotated cuboid
    get positiveCorner() {
        return this.transform.position.add(this.halfSize)
    }

    get positiveCornerRotated() {
        return this.transform.position.add(this.halfSizeRotated)
    }

    // only 90*x rotated cuboid
    isColliding(v: Vec3) {
        const pos = this.positiveCornerRotated
        const neg = this.negativeCornerRotated
        if (neg.x <= v.x && v.x <= pos.x && neg.z <= v.z && v.z <= pos.z) {
            // log('pos', pos)
            // log('halfSize', this.halfSize)
            // log('halfSizeRotated', this.halfSizeRotated)
            log('center', this.transform.position)
            log('is Colliding', v)
        }
        return neg.x <= v.x && v.x <= pos.x && neg.z <= v.z && v.z <= pos.z
    }

    // only non rotated cuboid
    pointSide(v: Vec3) {
        const diff = this.transform.position.substract(v)
        // const rotationMatrix = m4.yRotation(this.transform.rotation.y)
        // const diffRotated = diff.transformMat4(rotationMatrix)
        const diffRotated = diff

        let pointSide = Vec3.zero
        if (diffRotated.x > this.halfSizeRotated.x) {
            pointSide.x = -1
        }
        if (diffRotated.x < -this.halfSizeRotated.x) {
            pointSide.x = 1
        }
        if (diffRotated.z > this.halfSizeRotated.z) {
            pointSide.z = -1
        }
        if (diffRotated.z < -this.halfSizeRotated.z) {
            pointSide.z = 1
        }
        // log('diff.x', diffRotated.x)
        // log('diff.z', diffRotated.z)
        log('collisionSide', pointSide)
        return pointSide
    }

    pointSideRotated(v: Vec3) {
        const pointSide = this.pointSide(v)
        const rotationMatrix = m4.yRotation(-this.transform.rotation.y)
        return pointSide.transformMat4(rotationMatrix)
    }
    pointFarthestSideRotated(v: Vec3) {
        const pointSide = this.pointFarthestSide(v)
        const rotationMatrix = m4.yRotation(-this.transform.rotation.y)
        log('pointFarthestSideRotated', pointSide.transformMat4(rotationMatrix))
        return pointSide.transformMat4(rotationMatrix)
    }

    // only non rotated cuboid
    pointFarthestSide(v: Vec3) {
        const diff = this.transform.position.substract(v)
        const rotationMatrix = m4.yRotation(this.transform.rotation.y)
        const diffRotated = diff.transformMat4(rotationMatrix)
        let pointSide = this.pointSide(v)
        if (pointSide.x && pointSide.z) {
            if (Math.abs(diffRotated.x) > Math.abs(diffRotated.z)) {
                pointSide.z = 0
            } else {
                pointSide.x = 0
            }
        }
        return pointSide
    }

    // only non rotated cuboid
    nearestCorner(v: Vec3) {
        const diff = this.transform.position.substract(v)
        if (diff.x <= 0 && diff.z <= 0) {
            return this.transform.position.substract(this.halfSize)
        } else if (diff.x <= 0 && diff.z >= 0) {
            const cornerRelative = new Vec3(-this.halfSize.x, 0, this.halfSize.z)
            return this.transform.position.substract(cornerRelative)
        } else if (diff.x >= 0 && diff.z <= 0) {
            const cornerRelative = new Vec3(this.halfSize.x, 0, -this.halfSize.z)
            return this.transform.position.substract(cornerRelative)
        } else if (diff.x >= 0 && diff.z >= 0) {
            return this.transform.position.add(this.halfSize)
        }
    }

    nearestPoint(v: Vec3) {

    }
}