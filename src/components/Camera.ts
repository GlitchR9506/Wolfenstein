import { degToRad, Vec3, Transform, radToDeg, log, m4 } from './utils/index'

export default class Camera {
    rotationSpeed = 1
    movementSpeed = 100
    transform = new Transform

    get matrix() {
        let cameraMatrix = m4.identity
        cameraMatrix = m4.yRotate(cameraMatrix, this.transform.rotation.y)
        cameraMatrix = m4.translate(cameraMatrix, this.transform.position.inverted)
        return cameraMatrix
    }

    rotate(rotation: number) {
        this.transform.rotation.y += rotation * this.rotationSpeed
    }

    move(direction: Vec3) {
        const transformMatrix = m4.yRotation(-this.transform.rotation.y)
        const deltaPosition = direction.inverted.multiply(this.movementSpeed).transformMat4(transformMatrix)
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
}