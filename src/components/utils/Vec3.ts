export class Vec3 {
    x: number
    y: number
    z: number

    static get identity() {
        return new Vec3(1, 1, 1)
    }

    static get zero() {
        return new Vec3(0, 0, 0)
    }

    static get forward() {
        return new Vec3(0, 0, 1)
    }

    static get backward() {
        return new Vec3(0, 0, -1)
    }

    static get right() {
        return new Vec3(1, 0, 0)
    }

    static get left() {
        return new Vec3(-1, 0, 0)
    }

    static get up() {
        return new Vec3(0, 1, 0)
    }

    static get down() {
        return new Vec3(0, -1, 0)
    }



    constructor(x: number, y: number, z: number) {
        this.set(x, y, z)
    }

    set(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    get copy() {
        return new Vec3(this.x, this.y, this.z)
    }

    multiply(scalar: number) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar)
    }

    multiplyByVector(v: Vec3) {
        return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z)
    }

    equals(v: Vec3) {
        return this.x == v.x && this.y == v.y && this.z == v.z
    }

    cross(v: Vec3) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x,
        )
    }

    dot(v: Vec3) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }

    add(v: Vec3) {
        return new Vec3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        )
    }

    substract(v: Vec3) {
        return new Vec3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        )
    }

    get inverted() {
        return this.multiply(-1)
    }

    get normalize() {
        if (this.magnitude != 0) {
            const scale = 1 / this.magnitude
            return this.multiply(scale)
        } else {
            return Vec3.zero
        }
    }

    get magnitude() {
        // return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    transformMat4(m: number[]) {
        var w = m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15]
        w = w || 1.0
        let out = Vec3.zero
        out.x = (m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12]) / w
        out.y = (m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13]) / w
        out.z = (m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14]) / w
        return out
    }

    clone() {
        return new Vec3(this.x, this.y, this.z)
    }

    static fromAngle(angle: number) {
        angle = angle + 3 * Math.PI / 2
        return new Vec3(Math.cos(angle), 0, Math.sin(angle))
        // return new Vec3(Math.sin(angle), 0, -Math.cos(angle))
        // return new Vec3(Math.sin(angle), 0, Math.cos(angle))
    }

    map(f: (value: number) => number) {
        return new Vec3(
            f(this.x),
            f(this.y),
            f(this.z),
        )
    }

    get yZeroed() {
        return new Vec3(
            this.x,
            0,
            this.z,
        )
    }
}