import Config from "./Config"
import Shape from "./shapes/level/Shape"
import { Vec3 } from "./utils"

export default class Raycaster {
    from: Vec3
    dir: Vec3
    private squareGenerator: Generator<Vec3, void, unknown>

    private constructor(from: Vec3, dir: Vec3) {
        this.from = from.clone()
        this.dir = dir.clone()
        this.squareGenerator = this.nextSquareGenerator()
    }

    static fromDir(from: Vec3, dir: Vec3) {
        return new Raycaster(from, dir)
    }

    static fromTo(from: Vec3, to: Vec3) {
        const dir = to.substract(from).yZeroed.normalize
        return new Raycaster(from, dir)
    }

    private nextSquare() {
        return this.squareGenerator.next().value
    }

    nextShape(shapes: Shape[]) {
        let nextSquare = this.nextSquare()
        const limit = 100
        for (let i = 0; i < limit * 2; i++) {
            if (nextSquare) {
                for (let shape of shapes) {
                    if (shape.transform.position.yZeroed.equals(nextSquare.yZeroed)) {
                        return shape
                    }
                }
                nextSquare = this.nextSquare()
            }
        }
        return null
    }

    private * nextSquareGenerator() {
        let startClone = this.from.clone()
        let dirClone = this.dir.clone()
        const gridSize = Config.gridSize
        const firstTileCenter = startClone.map(v => Math.floor(v / gridSize) * gridSize + gridSize / 2).yZeroed
        yield firstTileCenter
        let firstYield = true
        while (true) {
            const [nextTileCenter, nextIntersection] = this.nextSquareInner(startClone, dirClone)
            if (firstYield) {
                firstYield = false
            }
            yield nextTileCenter
            startClone = nextIntersection
        }
    }

    private nextSquareInner(start: Vec3, dir: Vec3) {
        const gridSize = Config.gridSize
        if (dir.x >= 0) {
            start.x += gridSize * 0.0001
        } else {
            start.x -= gridSize * 0.0001
        }
        if (dir.z >= 0) {
            start.z += gridSize * 0.0001
        } else {
            start.z -= gridSize * 0.0001
        }
        const firstTileCenter = start.map(v => Math.floor(v / gridSize) * gridSize + gridSize / 2).yZeroed
        let nextIntersectingAxes = Vec3.zero
        if (start.x * dir.x > 0) {
            nextIntersectingAxes.x = Math.ceil(start.x / gridSize) * gridSize
        } else {
            nextIntersectingAxes.x = Math.floor(start.x / gridSize) * gridSize
        }
        if (start.z * dir.z > 0) {
            nextIntersectingAxes.z = Math.ceil(start.z / gridSize) * gridSize
        } else {
            nextIntersectingAxes.z = Math.floor(start.z / gridSize) * gridSize
        }
        const diff = start.substract(nextIntersectingAxes).abs
        const diffRatio = Math.abs(diff.z / diff.x)
        const dirRatio = Math.abs(dir.z / dir.x)
        let nextSquareInDirection, nextIntersection
        if (diffRatio > dirRatio) {
            nextSquareInDirection = new Vec3(1, 0, 0)
            nextIntersection = new Vec3(
                nextIntersectingAxes.x,
                0,
                start.z + (dir.z / dir.x) * (nextIntersectingAxes.x - start.x),
            )
        } else {
            if (diffRatio < dirRatio) {
                nextSquareInDirection = new Vec3(0, 0, 1)
            } else {
                nextSquareInDirection = new Vec3(1, 0, 1)
            }
            nextIntersection = new Vec3(
                start.x + (dir.x / dir.z) * (nextIntersectingAxes.z - start.z),
                0,
                nextIntersectingAxes.z,
            )
        }
        const nextSquare = new Vec3(
            dir.x > 0 ? nextSquareInDirection.x : -nextSquareInDirection.x,
            0,
            dir.z > 0 ? nextSquareInDirection.z : -nextSquareInDirection.z,
        )
        const nextTileCenter = firstTileCenter.add(nextSquare.multiply(gridSize))
        return [nextTileCenter, nextIntersection]
    }
}