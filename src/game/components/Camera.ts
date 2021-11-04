import { Vec3, Transform, radToDeg, m4, degToRad, log } from './utils'
import Wall from './shapes/Wall'
import Cuboid from './shapes/Cuboid'
import Shape from './shapes/Shape'
import Interactable from './shapes/Interactable'
import Enemy from './shapes/Enemy'
import Door from './shapes/Door'

export default class Camera {
    transform = new Transform
    projectionMatrix: number[]

    private readonly fov = 60
    private readonly zNear = 1
    private readonly zFar = 2000
    private readonly rotationSpeed = 1.5
    private readonly movementSpeed = 192
    // private readonly collisionRadius = 15
    private readonly collisionRadius = 20
    private readonly interactionDistance = 96
    private readonly gl: WebGLRenderingContext

    private blockedDirections: Vec3[] = []

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
        this.updateProjectionMatrix()
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

    move(direction: Vec3) {
        const transformMatrix = m4.yRotation(-this.transform.rotation.y)
        let deltaPosition = direction.inverted.multiply(this.movementSpeed).transformMat4(transformMatrix)

        for (let blockedDirection of this.blockedDirections) {
            // different sign
            if (blockedDirection.z * deltaPosition.z < 0) deltaPosition.z = 0
            if (blockedDirection.x * deltaPosition.x < 0) deltaPosition.x = 0
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
            // const currentRadius = this.collisionRadius
            const collidingPointTranslation = cameraToWallDirection.multiply(currentRadius)
            const collidingPoint = this.transform.position.add(collidingPointTranslation)
            collisionCandidates.push(collidingPoint)
        }
        for (let candidate of collisionCandidates) {
            if (cuboid.bb.isColliding(candidate)) {
                // const a = cuboid.bb.collisionSide(candidate)
                const collisionSide = cuboid.bb.pointSide(this.transform.position)
                return collisionSide
            }
        }

        // const collidingPointTranslation = cameraToWallDirection.multiply(this.collisionRadius)
        // const collidingPoint = this.transform.position.add(collidingPointTranslation)
        // const collisionCandidates = [collidingPoint, this.transform.position]
        // for (let candidate of collisionCandidates) {
        //     if (cuboid.bb.isColliding(candidate)) {
        //         return cuboid.bb.collisionSide(candidate)
        //     }
        // }
        return null
    }

    checkCollisions(cuboids: Cuboid[]) {
        const collidingSides = cuboids
            .map(c => this.cuboidCollisionSide(c))
            .filter(side => side !== null)
        // const blockedDirections = collidingSides.map(side => side.inverted)
        const blockedDirections = collidingSides.map(side => side)
        const uniqueBlockedDirections = blockedDirections.filter((direction, index, self) =>
            index === self.findIndex(d => d.equals(direction))
        )
        this.blockedDirections = uniqueBlockedDirections
    }

    isLookingAt(enemy: Enemy) {
        let lookingAtDir = Vec3.fromAngle(this.transform.rotation.y)
        let targetXDir = Vec3.up.cross(lookingAtDir).normalize

        let enemyLeft = enemy.transform.position.add(targetXDir.multiply(enemy.texturedSize.x / 2))
        let enemyRight = enemy.transform.position.substract(targetXDir.multiply(enemy.texturedSize.x / 2))

        let angleLeft = this.angleTo(enemyLeft)
        let angleRight = this.angleTo(enemyRight)

        let lookingAtEnemy = angleLeft > 0 && angleRight < 0

        return lookingAtEnemy
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