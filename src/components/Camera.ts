import m4 from './m4'
import { degToRad, Vec3, Transform, radToDeg } from './utils'

export default class Camera {
    rotationSpeed = 1
    movementSpeed = 100
    private readonly gl: WebGLRenderingContext
    private transform = new Transform

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
    }

    get matrix() {
        let cameraMatrix = m4.identity
        cameraMatrix = m4.yRotate(cameraMatrix, this.transform.rotation.y)
        cameraMatrix = m4.translate(cameraMatrix, this.transform.position)
        return cameraMatrix
    }

    rotate(rotation: number, deltaTime: number) {
        this.transform.rotation.y += rotation * deltaTime * this.rotationSpeed

    }

    move(direction: Vec3, deltaTime: number) {
        const deltaPosition = direction.multiply(deltaTime * this.movementSpeed).transformMat4(m4.yRotation(-this.transform.rotation.y))
        this.transform.position = this.transform.position.add(deltaPosition)
    }
}