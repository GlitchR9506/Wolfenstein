import Program from './Program'
import ShapeLetter from './ShapeLetter'
import Camera from './Camera'
import Movement from './Movement'
import Cube from './Cube'
import Enemy from './Enemy'
import Crosshair from './Crosshair'
import m4 from './m4'
import { degToRad, radToDeg, Vec3, log } from './utils'


export default class Game {
    private readonly program: Program
    private readonly camera: Camera
    private readonly cube: Cube
    private readonly movement: Movement
    private readonly enemy: Enemy
    private readonly crosshair: Crosshair
    private readonly shapes: ShapeLetter[] = []
    private readonly gl: WebGLRenderingContext
    private projectionMatrix: number[]

    constructor() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.gl = canvas.getContext("webgl");
        if (!this.gl) { /*no webgl for you!*/ }
        this.gl.clearColor(0, 0, 0, 0);

        this.program = new Program(this.gl)
        this.camera = new Camera()
        this.movement = new Movement()
        this.crosshair = new Crosshair(this.gl)
        this.crosshair.updateBuffers()
        this.cube = new Cube(this.gl)
        this.cube.updateBuffers()

        this.cube.transform.position.z = -150
        // this.camera.transform.position.z = -150
        this.enemy = new Enemy(this.gl)
        this.enemy.updateBuffers()
        this.enemy.transform.position.z = -100

        {
            const shapesCount = 5
            const radius = 100
            for (let i = 0; i < shapesCount; i++) {
                const shape = new ShapeLetter(this.gl)
                shape.updateBuffers()

                const angle = i * Math.PI * 2 / shapesCount;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                shape.transform.position.x = x
                shape.transform.position.z = z
                this.shapes.push(shape)
            }
        }

        this.updateProjectionMatrix()

        this.startGameLoop()
    }

    private startGameLoop() {
        let then = 0
        requestAnimationFrame(now => render(now));
        const render = (now: number) => {
            now *= 0.001;  // convert to seconds
            const deltaTime = now - then;
            then = now;

            this.draw(deltaTime)

            requestAnimationFrame(now => render(now));
        }
    }

    private draw(deltaTime: number) {
        this.setDrawSettings()

        this.camera.rotate(this.movement.rotation * deltaTime)
        this.camera.move(this.movement.direction.multiply(deltaTime))

        // this.shapes.forEach(shape => {
        //     shape.transform.rotation.y += degToRad(-50) * deltaTime
        //     shape.draw(this.program.info, this.viewProjectionMatrix)
        // })

        let lookingAtEnemy = this.isCameraLookingAtEnemy(this.enemy)
        log('lookingAtEnemy', lookingAtEnemy)
        if (lookingAtEnemy) {
            if (this.movement.shooting) {
                this.enemy.setColor(0, [255, 0, 0])
                this.enemy.updateBuffers()
            }
        } else {
            this.enemy.resetColor()
            this.enemy.updateBuffers()
        }

        this.cube.draw(this.program.info, this.viewProjectionMatrix)

        this.crosshair.draw(this.program.info, this.projectionMatrix)

        this.enemy.draw(this.program.info, this.viewProjectionMatrix)
        this.enemy.lookAtCamera(this.camera.transform.rotation.y)
    }

    isCameraLookingAtEnemy(enemy: Enemy) {
        let lookingAtDir = Vec3.fromAngle(this.camera.transform.rotation.y)
        let targetXDir = Vec3.up.cross(lookingAtDir).normalize

        let enemyLeft = enemy.transform.position.add(targetXDir.multiply(enemy.size.x / 2))
        let enemyRight = enemy.transform.position.substract(targetXDir.multiply(enemy.size.x / 2))

        let angleLeft = this.camera.angleTo(enemyLeft)
        let angleRight = this.camera.angleTo(enemyRight)

        let lookingAtEnemy = angleLeft > 0 && angleRight < 0

        return lookingAtEnemy
    }

    private get viewProjectionMatrix() {
        return m4.multiply(this.projectionMatrix, this.camera.matrix);
    }

    private updateProjectionMatrix() {
        const fieldOfViewRadians = degToRad(60)
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight
        const zNear = 1
        const zFar = 2000
        this.projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    }

    private setDrawSettings() {
        this.resizeCanvasToDisplaySize(this.gl.canvas)

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.program.use()

        this.movement.update()
    }

    private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

        if (needResize) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            this.updateProjectionMatrix()
        }

        return needResize;
    }
}