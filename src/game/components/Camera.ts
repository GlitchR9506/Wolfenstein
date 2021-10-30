import { degToRad, Vec3, Transform, radToDeg, log, m4 } from './utils'
import Wall from './Wall'

export default class Camera {
    rotationSpeed = 1
    movementSpeed = 100
    collisionRadius = 15
    transform = new Transform
    blockedDirections: Vec3[] = []

    get matrix() {
        let cameraMatrix = m4.identity
        cameraMatrix = m4.translate(cameraMatrix, this.transform.position.inverted)
        cameraMatrix = m4.yRotate(cameraMatrix, this.transform.rotation.y)
        return cameraMatrix
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

    wallCollisionSide(wall: Wall) {
        const cameraToWall = this.transform.position.yZeroed.to(wall.transform.position.yZeroed)
        const cameraToWallDirection = cameraToWall.normalize
        const collidingPointTranslation = cameraToWallDirection.multiply(this.collisionRadius)
        const collidingPoint = this.transform.position.add(collidingPointTranslation)
        const collisionCandidates = [collidingPoint, this.transform.position]
        for (let candidate of collisionCandidates) {
            if (wall.bb.isColliding(candidate)) {
                return wall.bb.collisionSide(candidate)
            }
        }
        return null
    }

    checkCollisions(walls: Wall[]) {
        const collidingSides = walls
            .map(w => this.wallCollisionSide(w))
            .filter(side => side !== null)
        const blockedDirections = collidingSides.map(side => side.inverted)
        const uniqueBlockedDirections = blockedDirections.filter((direction, index, self) =>
            index === self.findIndex(d => d.equals(direction))
        )
        this.blockedDirections = uniqueBlockedDirections
    }
}