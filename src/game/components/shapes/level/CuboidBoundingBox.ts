import Shape from "./Shape";
import { log, m4, Transform, Vec3 } from "../../utils";

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

    get negativeCorner() {
        return this.transform.position.substract(this.halfSize)
    }

    get negativeCornerRotated() {
        return this.transform.position.substract(this.halfSizeRotated)
    }

    get positiveCorner() {
        return this.transform.position.add(this.halfSize)
    }

    get positiveCornerRotated() {
        return this.transform.position.add(this.halfSizeRotated)
    }

    isColliding(v: Vec3) {
        const pos = this.positiveCornerRotated
        const neg = this.negativeCornerRotated
        return neg.x <= v.x && v.x <= pos.x && neg.z <= v.z && v.z <= pos.z
    }

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
        return pointSide
    }

    nearestDistanceDirection(v: Vec3) {
        const side = this.pointSide(v)
        if (side.x && side.z) {
            return v.substract(this.nearestCorner(v)).yZeroed.normalize
        } else {
            return side
        }
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

    // only a non rotated cuboid
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

    // cuboid rotated by any value
    nearestCorner(v: Vec3) {
        const diff = this.transform.position.substract(v)
        if (diff.x <= 0 && diff.z <= 0) {
            return this.transform.position.substract(this.halfSizeRotated)
        } else if (diff.x <= 0 && diff.z >= 0) {
            const cornerRelative = new Vec3(-this.halfSizeRotated.x, 0, this.halfSizeRotated.z)
            return this.transform.position.substract(cornerRelative)
        } else if (diff.x >= 0 && diff.z <= 0) {
            const cornerRelative = new Vec3(this.halfSizeRotated.x, 0, -this.halfSizeRotated.z)
            return this.transform.position.substract(cornerRelative)
        } else if (diff.x >= 0 && diff.z >= 0) {
            return this.transform.position.add(this.halfSizeRotated)
        }
    }

    basePointsYZeroed() {
        const a = this.halfSizeRotated.yZeroed
        return [
            this.transform.position.add(a),
            this.transform.position.add(a.xInverted),
            this.transform.position.add(a.yInverted),
            this.transform.position.substract(a),
        ]
    }
}