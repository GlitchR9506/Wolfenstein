import Program from './Program'
import ShapeLetter from './ShapeLetter'
import Camera from './Camera'
import Movement from './Movement'
import Cube from './Cube'
import Enemy from './Enemy'
import m4 from './m4'
import { degToRad, Vec3 } from './utils'


export default class Game {
    private readonly program: Program
    private readonly camera: Camera
    private readonly cube: Cube
    private readonly movement: Movement
    private readonly enemy: Enemy
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
        this.cube = new Cube(this.gl)
        this.cube.setBuffers()
        this.cube.transform.position.z = -150
        this.enemy = new Enemy(this.gl)
        this.enemy.setBuffers()
        this.enemy.transform.position.z = -100

        {
            const shapesCount = 5
            const radius = 100
            for (let i = 0; i < shapesCount; i++) {
                const shape = new ShapeLetter(this.gl)
                shape.setBuffers()

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

        this.cube.draw(this.program.info, this.viewProjectionMatrix)

        this.enemy.draw(this.program.info, this.viewProjectionMatrix)
        this.enemy.lookAtCamera(this.camera.transform.rotation.y)
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