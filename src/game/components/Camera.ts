import { Vec3, Transform, radToDeg, m4, degToRad, log, Vec2 } from './utils'
import Cuboid from './shapes/Cuboid'
import Shape from './shapes/Shape'
import Interactable from './shapes/Interactable'
import Enemy from './shapes/Enemy'
import Door from './shapes/Door'
import Config from './Config'
import Weapons from './shapes/Weapons'

export default class Camera {
    transform = new Transform
    projectionMatrix: number[]

    readonly weapons: Weapons
    private readonly fov = 60
    private readonly zNear = Config.gridSize / 64
    private readonly zFar = Config.gridSize * 48
    private readonly rotationSpeed = 1.5
    private readonly movementSpeed = Config.gridSize * 3
    private readonly collisionRadius = Config.gridSize / 3
    private readonly interactionDistance = Config.gridSize * 1.5
    private readonly gl: WebGLRenderingContext

    private blockedDirections: Vec3[] = []

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
        this.updateProjectionMatrix()
        this.weapons = new Weapons(this.gl)
    }

    get matrix() {
        let cameraMatrix = m4.identity
        cameraMatrix = m4.translate(cameraMatrix, this.transform.position.inverted)
        cameraMatrix = m4.yRotate(cameraMatrix, this.transform.rotation.y)
        return cameraMatrix
    }

    nearest(shapes: Shape[]) {
        const sorted = shapes.sort((a, b) => {
            return (
                a.initialTransform.position.distanceTo(this.transform.position) -
                b.initialTransform.position.distanceTo(this.transform.position)
            )
        })
        return sorted[0]
    }

    inInteractionDistance(shape: Interactable) {
        return shape.initialTransform.position.distanceTo(this.transform.position) <= this.interactionDistance
    }

    rotate(rotation: number) {
        this.transform.rotation.y += rotation * this.rotationSpeed
    }

    move(direction: Vec3, collidingCuboids?: Cuboid[]) {
        const transformMatrix = m4.yRotation(-this.transform.rotation.y)
        let deltaPosition = direction.inverted.multiply(this.movementSpeed).transformMat4(transformMatrix)

        for (let blockedDirection of this.blockedDirections) {
            // corner shorter side selection
            if (blockedDirection.x && blockedDirection.z) {
                if (Math.abs(blockedDirection.x) > Math.abs(blockedDirection.z)) {
                    blockedDirection.x = 0
                } else {
                    blockedDirection.z = 0
                }
            }

            // different sign
            if (blockedDirection.z * deltaPosition.z < 0) deltaPosition.z = 0
            if (blockedDirection.x * deltaPosition.x < 0) deltaPosition.x = 0
        }

        if (collidingCuboids) {
            this.checkCollisions(collidingCuboids.filter(c => c.transform.position.distanceTo(this.transform.position) < Config.gridSize * 2))
        } else {
            this.blockedDirections = []
        }

        this.transform.position = this.transform.position.add(deltaPosition)
    }

    angleTo(targetPosition: Vec3) {
        let toTargetDir = targetPosition.substract(this.transform.position).yZeroed.normalize
        let lookingAtDir = Vec3.fromAngle(this.transform.rotation.y)
        let toTargetAngle = Math.atan2(toTargetDir.z, toTargetDir.x)
        let lookingAtAngle = Math.atan2(lookingAtDir.z, lookingAtDir.x)
        let angleDiff = radToDeg(lookingAtAngle - toTargetAngle)
        if (angleDiff > 180) angleDiff -= 360
        if (angleDiff < -180) angleDiff += 360
        return angleDiff
    }

    cuboidCollisionSide(cuboid: Cuboid) {
        const cameraToWall = this.transform.position.yZeroed.to(cuboid.transform.position.yZeroed)
        const cameraToWallDirection = cameraToWall.normalize

        let steps = 1
        if (cuboid instanceof Door) {
            steps = 10
        }

        let collisionCandidates = [this.transform.position]
        for (let i = this.collisionRadius; i > 0; i -= this.collisionRadius / steps) {
            const currentRadius = i
            const collidingPointTranslation = cameraToWallDirection.multiply(currentRadius)
            const collidingPoint = this.transform.position.add(collidingPointTranslation)
            collisionCandidates.push(collidingPoint)
        }
        for (let candidate of collisionCandidates) {
            if (cuboid.bb.isColliding(candidate)) {
                let collisionSide = cuboid.bb.nearestDistanceDirection(this.transform.position)
                if (collisionSide.x && collisionSide.z) {
                    const nearestCorner = cuboid.bb.nearestCorner(candidate)
                    const nearestCornerDiff = this.transform.position.substract(nearestCorner).abs
                    if (nearestCornerDiff.x > nearestCornerDiff.z) {
                        collisionSide.z = 0
                    } else {
                        collisionSide.x = 0
                    }
                }
                log('col side', collisionSide)

                // this.transform.position = this.transform.position.add(collisionSide)
                return collisionSide
            }
        }
        return null
    }

    checkCollisions(cuboids: Cuboid[]) {
        const collidingSides = cuboids
            .map(c => this.cuboidCollisionSide(c))
            .filter(side => side !== null)
        // const blockedDirections = collidingSides.map(side => side.inverted)
        const blockedDirections = collidingSides
        const uniqueBlockedDirections = blockedDirections.filter((direction, index, self) =>
            index === self.findIndex(d => d.equals(direction))
        )
        this.blockedDirections = uniqueBlockedDirections
    }

    isLookingAt(enemy: Enemy) {
        const lookingAtDir = Vec3.fromAngle(this.transform.rotation.y)
        const targetXDir = Vec3.up.cross(lookingAtDir).normalize

        const enemyLeft = enemy.transform.position.add(targetXDir.multiply(enemy.texturedSize.x / 2))
        const enemyRight = enemy.transform.position.substract(targetXDir.multiply(enemy.texturedSize.x / 2))

        const angleLeft = this.angleTo(enemyLeft)
        const angleRight = this.angleTo(enemyRight)

        const lookingAtEnemy = 0 < angleLeft && angleLeft < 90 && -90 < angleRight && angleRight < 0

        return lookingAtEnemy
    }

    raycast(shapes: Shape[]) {
        const nextSquareGenerator = this.nextSquare(this.transform.position, Vec3.fromAngle(this.transform.rotation.y))

        let nextSquare = nextSquareGenerator.next().value
        const limit = 100
        for (let i = 0; i < limit * 2; i++) {
            if (nextSquare) {
                for (let shape of shapes) {
                    if (shape.transform.position.yZeroed.equals(nextSquare.yZeroed)) {
                        return shape
                    }
                }
                nextSquare = nextSquareGenerator.next().value
            }
        }
        return null
    }

    * nextSquare(start: Vec3, dir: Vec3) {
        let startClone = start.clone()
        let dirClone = dir.clone()
        const gridSize = Config.gridSize
        const firstTileCenter = startClone.map(v => Math.floor(v / gridSize) * gridSize + gridSize / 2).yZeroed
        // console.log('firstTileCenter', firstTileCenter)
        yield firstTileCenter
        let firstYield = true
        while (true) {
            const [nextTileCenter, nextIntersection] = this.nextSquareInner(startClone, dirClone)
            if (firstYield) {
                // console.log('nextTileCenter', nextTileCenter)
                firstYield = false
            }
            yield nextTileCenter
            startClone = nextIntersection
        }
    }

    nextSquareInner(start: Vec3, dir: Vec3) {
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

    get viewProjectionMatrix() {
        return m4.multiply(this.matrix, this.projectionMatrix);
    }

    updateProjectionMatrix() {
        const fieldOfViewRadians = degToRad(this.fov)
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight
        const zNear = this.zNear
        const zFar = this.zFar
        this.projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    }

}