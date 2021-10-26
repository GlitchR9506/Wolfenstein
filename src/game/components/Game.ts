import Program from './Program'
import ShapeLetter from './ShapeLetter'
import Camera from './Camera'
import Movement from './Movement'
import Cube from './Cube'
import Enemy from './Enemy'
import Level from './Level'
import Crosshair from './Crosshair'
import { m4, degToRad, radToDeg, Vec3, log } from './utils/index'


export default class Game {
    private readonly program: Program
    private readonly camera: Camera
    private readonly movement: Movement
    private readonly level: Level
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
        this.level = new Level(this.gl, () => {
            this.camera.transform.position = this.level.playerPosition
        })

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

        for (let enemy of this.level.enemies) {
            let lookingAtEnemy = this.isCameraLookingAtEnemy(enemy)
            if (lookingAtEnemy) {
                if (this.movement.shooting) {
                    enemy.setColor(0, [255, 0, 0])
                    enemy.updateBuffers()
                }
            } else {
                enemy.resetColor()
                enemy.updateBuffers()
            }
            enemy.lookAtCamera(this.camera.transform.rotation.y)
            enemy.draw(this.program.info, this.viewProjectionMatrix)
        }
        for (let wall of this.level.walls) {
            wall.draw(this.program.info, this.viewProjectionMatrix)
        }

        this.crosshair.draw(this.program.info, this.projectionMatrix)
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