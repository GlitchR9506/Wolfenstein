import Shape from "./Shape";
import { Transform, Vec3 } from "../utils";

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
        const positive = this.transform.position.add(this.halfSize)
        const negative = this.transform.position.substract(this.halfSize)
        return negative.x <= v.x && v.x <= positive.x && negative.z <= v.z && v.z <= positive.z
    }

    // only non rotated cuboid
    collisionSide(v: Vec3) {
        const xDiff = this.transform.position.x - v.x
        const zDiff = this.transform.position.z - v.z
        if (Math.abs(xDiff) > Math.abs(zDiff)) {
            return xDiff > 0 ? Vec3.right : Vec3.left
        } else {
            return zDiff > 0 ? Vec3.forward : Vec3.backward
        }
    }
}