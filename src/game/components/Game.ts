import Program from './Program'
import Camera from './Camera'
import Input from './Input'
import Level from './Level'
import Crosshair from './shapes/Crosshair'
import { log } from './utils'


export default class Game {
    private readonly program: Program
    private readonly camera: Camera
    private readonly input: Input
    private readonly level: Level
    private readonly crosshair: Crosshair
    private readonly gl: WebGLRenderingContext

    constructor() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.gl = canvas.getContext("webgl");
        if (!this.gl) { /*no webgl for you!*/ }
        this.gl.clearColor(0, 0, 0, 0);

        this.program = new Program(this.gl)
        this.camera = new Camera(this.gl)
        this.input = new Input()
        this.crosshair = new Crosshair(this.gl)
        this.level = new Level(this.gl, () => {
            this.camera.transform.position = this.level.playerPosition
        })

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

        for (let enemy of this.level.enemies) {
            let lookingAtEnemy = this.camera.isLookingAt(enemy)
            if (lookingAtEnemy) {
                if (this.input.shooting) {
                    enemy.setColor(0, [255, 0, 0])
                    enemy.updateBuffers()
                }
            } else {
                enemy.resetColor()
                enemy.updateBuffers()
            }
            enemy.lookAtCamera(this.camera.transform.rotation.y)
            enemy.draw(this.program.info, this.camera.viewProjectionMatrix)
        }

        for (let wall of this.level.walls) {
            wall.draw(this.program.info, this.camera.viewProjectionMatrix)
        }

        this.camera.checkCollisions(this.level.walls)

        this.crosshair.draw(this.program.info, this.camera.projectionMatrix)

        this.camera.rotate(this.input.rotation * deltaTime)
        this.camera.move(this.input.direction.multiply(deltaTime))
    }


    private setDrawSettings() {
        this.resizeCanvasToDisplaySize(this.gl.canvas)

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.program.use()

        this.input.update()
    }

    private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

        if (needResize) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            this.camera.updateProjectionMatrix()
        }

        return needResize;
    }
}