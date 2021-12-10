import { Vec3, Transform, radToDeg, m4, degToRad, log, Vec2 } from './utils'
import Shape from './shapes/level/Shape'
import Interactable from './shapes/level/Interactable'
import Enemy from './shapes/level/Enemy'
import Door from './shapes/level/Door'
import Config from './Config'
import Weapons from './shapes/ui/Weapons'
import { Program } from './programs/Program'
import Input from './Input'
import Raycaster from './Raycaster'

export default class Camera {
    transform = new Transform
    initialTransform: Transform
    projectionMatrix: number[]
    collidingShapes: Shape[]
    killer: Enemy = null

    readonly weapons: Weapons
    private readonly fov = 60
    private readonly zNear = Config.gridSize / 64
    private readonly zFar = Config.gridSize * 48
    private readonly rotationSpeed = 1.6
    private readonly movementSpeed = Config.gridSize * 5
    private readonly collisionRadius = Config.gridSize / 3
    private readonly interactionDistance = Config.gridSize * 1.5
    private readonly gl: WebGLRenderingContext

    private blockedDirections: Vec3[] = []

    constructor(gl: WebGLRenderingContext, program: Program) {
        this.gl = gl
        this.updateProjectionMatrix()
        this.weapons = new Weapons(this.gl, program)
        this.transform.rotation.y = degToRad(90)
    }

    get matrix() {
        let cameraMatrix = m4.identity
        cameraMatrix = m4.translate(cameraMatrix, this.transform.position.inverted)
        cameraMatrix = m4.yRotate(cameraMatrix, this.transform.rotation.y)
        return cameraMatrix
    }

    update(deltaTime: number) {
        this.rotate(Input.instance.rotation * deltaTime)
        let speed = Input.instance.direction.multiply(deltaTime)
        if (Input.instance.sprinting) {
            speed = speed.multiply(5)
        }
        if (Input.instance.noclip) {
            this.move(speed)
        } else {
            this.move(speed, this.collidingShapes)
        }
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

    move(direction: Vec3, collidingShapes?: Shape[]) {
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

        if (collidingShapes) {
            this.checkCollisions(collidingShapes.filter(c => c.transform.position.distanceTo(this.transform.position) < Config.gridSize * 2))
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

    cuboidCollisionSide(cuboid: Shape) {
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

    checkCollisions(shapes: Shape[]) {
        const collidingSides = shapes
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

    get viewProjectionMatrix() {
        return m4.multiply(this.matrix, this.projectionMatrix);
    }

    updateProjectionMatrix() {
        const fieldOfViewRadians = degToRad(this.fov)
        // const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight
        const aspect = 2
        const zNear = this.zNear
        const zFar = this.zFar
        this.projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    }

    lookAt(target: Vec3) {
        let toTargetDir = target.substract(this.transform.position).yZeroed.normalize
        let toTargetAngle = Math.atan2(toTargetDir.z, toTargetDir.x)
        this.transform.rotation.y = toTargetAngle + degToRad(90)
    }

    lookAtKillerStep(deltaTime: number) {
        const angle = this.angleTo(this.killer.transform.position)
        if (Math.abs(angle) < Math.abs(radToDeg(this.rotationSpeed * deltaTime))) {
            this.lookAt(this.killer.transform.position)
        } else {
            if (angle > 0) {
                this.rotate(-1 * deltaTime)
            } else if (angle < 0) {
                this.rotate(1 * deltaTime)
            }
        }
    }
}