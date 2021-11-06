import { ColorProgram, ColorProgramInfo } from './programs/ColorProgram'
import Camera from './Camera'
import Input from './Input'
import Level from './Level'
import Crosshair from './shapes/Crosshair'
import { degToRad, log, radToDeg } from './utils'
import Interactable from './shapes/Interactable'
import { TextureProgram } from './programs/TextureProgram'
import Wall from './shapes/Wall'
import Door from './shapes/Door'
import Enemy from './shapes/Enemy'
import Textures from './Textures'


export default class Game {
    private readonly colorProgram: ColorProgram
    private readonly textureProgram: TextureProgram
    private readonly camera: Camera
    private readonly input: Input
    private readonly textures: Textures
    private readonly level: Level
    private readonly crosshair: Crosshair
    private readonly gl: WebGLRenderingContext

    constructor() {
        this.initWebgl()

        this.colorProgram = new ColorProgram(this.gl)
        this.textureProgram = new TextureProgram(this.gl)

        this.input = new Input()
        this.camera = new Camera(this.gl)
        this.textures = new Textures(this.gl)
        this.level = new Level(this.gl)
        this.crosshair = new Crosshair(this.gl)

        this.textures.load([Wall, Enemy, Door], () => {
            this.level.load(1, () => {
                this.camera.transform.position = this.level.playerPosition
                this.startGameLoop()
            })
        })
    }

    private startGameLoop() {
        let then = 0
        const render = (now: number) => {
            now *= 0.001  // convert to seconds
            const deltaTime = now - then
            then = now

            this.draw(deltaTime)

            requestAnimationFrame(render)
        }
        requestAnimationFrame(render)
    }

    private draw(deltaTime: number) {
        this.setDrawSettings()

        if (this.input.interacting) {
            const nearestInteractable = this.camera.nearest(this.level.interactables) as Interactable
            if (this.camera.inInteractionDistance(nearestInteractable)) {
                nearestInteractable.interact()
                this.input.justInteracted = true
            }
        }

        this.camera.rotate(this.input.rotation * deltaTime)
        this.camera.move(this.input.direction.multiply(deltaTime), this.level.collidingCuboids)
        this.colorProgram.use()

        this.crosshair.draw(this.colorProgram.info, this.camera.projectionMatrix)


        this.textureProgram.use()

        this.textures.useTexture(Wall)
        for (let wall of this.level.walls) {
            wall.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)
        }


        this.textures.useTexture(Door)
        for (let door of this.level.doors) {
            door.update(deltaTime)
            door.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)
        }
        this.textures.useTexture(Enemy)
        for (let enemy of this.level.enemies) {
            if (this.camera.isLookingAt(enemy)) {
                if (this.input.shooting) {
                    // enemy.setColor(0, [255, 0, 0])
                    enemy.transform.position.y = 50
                    enemy.updateBuffers()
                }
            } else {
                // enemy.resetColor()
                enemy.transform.position.y = 0
                enemy.updateBuffers()
            }
            enemy.lookAtCamera(this.camera.transform.rotation.y)
            enemy.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)
        }

    }

    private initWebgl() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement

        (this.gl as WebGLRenderingContext) = canvas.getContext("webgl")

        if (!this.gl) {
            alert("No webgl for you")
        }

        this.gl.clearColor(0, 0, 0, 0)

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);

        this.gl.enable(this.gl.CULL_FACE)
        this.gl.enable(this.gl.DEPTH_TEST)
    }

    private setDrawSettings() {
        this.resizeCanvasToDisplaySize(this.gl.canvas)

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        this.input.update()
    }

    private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
        const displayWidth = canvas.clientWidth
        const displayHeight = canvas.clientHeight

        const resizeNeeded = canvas.width !== displayWidth || canvas.height !== displayHeight

        if (resizeNeeded) {
            canvas.width = displayWidth
            canvas.height = displayHeight
            this.camera.updateProjectionMatrix()
        }

        return resizeNeeded
    }
}