export class Vec2 {
    x: number
    y: number

    static arrayToVec2Array(a: number[] | Float32Array) {
        let array: Vec2[] = []
        for (let i = 0; i < a.length; i += 2) {
            array.push(new Vec2(
                a[i],
                a[i + 1],
            ))
        }
        return array
    }

    static vec2ArrayToArray(a: Vec2[]) {
        let array: number[] = []
        for (let vec of a) {
            array.push(vec.x, vec.y)
        }
        return array
    }

    constructor(x: number, y: number) {
        this.set(x, y)
    }

    set(x: number, y: number) {
        this.x = x
        this.y = y
    }

    multiply(scalar: number) {
        return new Vec2(this.x * scalar, this.y * scalar)
    }

    add(v: Vec2) {
        return new Vec2(
            this.x + v.x,
            this.y + v.y
        )
    }
}