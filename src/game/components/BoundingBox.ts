import Shape from "./Shape";
import { Transform, Vec3 } from "./utils";

export class BoundingBox {
    readonly size: Vec3
    readonly transform: Transform

    constructor(shape: Shape) {
        this.size = shape.size
        this.transform = shape.transform
    }

    // get center() {
    //     return this.position.add(this.size.multiply(0.5))
    // }

    // get endPosition() {
    //     return this.position.add(this.size)
    // }
}