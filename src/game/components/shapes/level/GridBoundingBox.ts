import { log, m4, Transform, Vec3 } from "../../utils";

export class GridBoundingBox {
    center: Vec3
    size: Vec3

    constructor(center: Vec3, size: Vec3) {
        this.center = center
        this.size = size
    }

    get halfSize() {
        return this.size.multiply(0.5)
    }

    get negativeCorner() {
        return this.center.substract(this.halfSize)
    }

    get positiveCorner() {
        return this.center.add(this.halfSize)
    }

    isColliding(v: Vec3) {
        const pos = this.positiveCorner
        const neg = this.negativeCorner
        return neg.x <= v.x && v.x <= pos.x && neg.z <= v.z && v.z <= pos.z
    }

    pointSide(v: Vec3) {
        const diff = this.center.substract(v)
        const diffRotated = diff

        let pointSide = Vec3.zero
        if (diffRotated.x > this.halfSize.x) {
            pointSide.x = -1
        }
        if (diffRotated.x < -this.halfSize.x) {
            pointSide.x = 1
        }
        if (diffRotated.z > this.halfSize.z) {
            pointSide.z = -1
        }
        if (diffRotated.z < -this.halfSize.z) {
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

    // only a non rotated cuboid
    pointFarthestSide(v: Vec3) {
        const diff = this.center.substract(v)
        let pointSide = this.pointSide(v)
        if (pointSide.x && pointSide.z) {
            if (Math.abs(diff.x) > Math.abs(diff.z)) {
                pointSide.z = 0
            } else {
                pointSide.x = 0
            }
        }
        return pointSide
    }

    // cuboid rotated by any value
    nearestCorner(v: Vec3) {
        const diff = this.center.substract(v)
        if (diff.x <= 0 && diff.z <= 0) {
            return this.center.substract(this.halfSize)
        } else if (diff.x <= 0 && diff.z >= 0) {
            const cornerRelative = new Vec3(-this.halfSize.x, 0, this.halfSize.z)
            return this.center.substract(cornerRelative)
        } else if (diff.x >= 0 && diff.z <= 0) {
            const cornerRelative = new Vec3(this.halfSize.x, 0, -this.halfSize.z)
            return this.center.substract(cornerRelative)
        } else if (diff.x >= 0 && diff.z >= 0) {
            return this.center.add(this.halfSize)
        }
    }

    basePointsYZeroed() {
        const a = this.halfSize.yZeroed
        return [
            this.center.add(a),
            this.center.add(a.xInverted),
            this.center.add(a.yInverted),
            this.center.substract(a),
        ]
    }
}