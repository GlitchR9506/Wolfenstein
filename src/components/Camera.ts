import m4 from './m4'
import { degToRad, Vec3, Transform, radToDeg } from './utils'

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
        let toTargetVec = targetPosition.substract(this.transform.position).yZeroed.normalize
        let lookingAtVec = Vec3.fromAngle(this.transform.rotation.y).inverted
        let angle = Math.acos(lookingAtVec.dot(toTargetVec) / (lookingAtVec.magnitude * toTargetVec.magnitude))
        let angleDiff = 180 - radToDeg(angle)
        return angleDiff
    }
}