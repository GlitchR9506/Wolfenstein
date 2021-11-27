import { ColorProgram } from './programs/ColorProgram'
import { TextureProgram } from './programs/TextureProgram'

import { degToRad, log, radToDeg, Vec3 } from './utils'
import Camera from './Camera'
import Input from './Input'
import Textures from './Textures'

import Level from './Level'
import Wall from './shapes/Wall'
import Door from './shapes/Door'
import Enemy from './shapes/Enemy'
import Ammo from './shapes/pickups/Ammo'

import Crosshair from './shapes/Crosshair'
import Weapons from './shapes/Weapons'
import Interactable from './shapes/Interactable'
import Shape from './shapes/Shape'


export default class Game {
    private readonly colorProgram: ColorProgram
    private readonly textureProgram: TextureProgram
    private readonly camera: Camera
    private readonly input: Input
    private readonly textures: Textures
    private readonly level: Level
    private readonly crosshair: Crosshair
    private readonly ammo: Ammo
    private readonly gl: WebGLRenderingContext
    private lineShapes: Shape[] = []

    constructor() {
        this.initWebgl()

        this.colorProgram = new ColorProgram(this.gl)
        this.textureProgram = new TextureProgram(this.gl)

        this.input = new Input()
        this.camera = new Camera(this.gl)
        this.textures = new Textures(this.gl)
        this.level = new Level(this.gl)
        this.crosshair = new Crosshair(this.gl)
        this.ammo = new Ammo(this.gl)
        this.textures.load([Wall, Enemy, Door, Weapons, Ammo], () => {
            this.level.load(2, () => {
                this.camera.transform.position = this.level.playerPosition
                this.ammo.transform.position = this.level.playerPosition.clone()
                this.ammo.transform.position.z -= 64
                this.ammo.setInitialState()
                // console.log(this.pickup.transform.position)
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

        log('ammo', this.camera.weapons.ammo)

        this.camera.rotate(this.input.rotation * deltaTime)
        if (this.input.noclip) {
            this.camera.move(this.input.direction.multiply(deltaTime))
        } else {
            this.camera.move(this.input.direction.multiply(deltaTime), this.level.collidingCuboids)
        }

        this.colorProgram.use()

        this.crosshair.draw(this.colorProgram.info, this.camera.projectionMatrix)
        this.level.floor.draw(this.colorProgram.info, this.camera.viewProjectionMatrix)
        this.level.ceiling.draw(this.colorProgram.info, this.camera.viewProjectionMatrix)


        this.textureProgram.use()

        this.gl.bindTexture(this.gl.TEXTURE_2D, Ammo.webglTexture);
        this.ammo.lookAtCamera(this.camera.transform.rotation.y)
        this.ammo.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)

        this.gl.bindTexture(this.gl.TEXTURE_2D, Weapons.webglTexture);

        this.camera.weapons.setShooting(this.input.shooting && this.camera.weapons.ammo > 0)

        if (this.input.shot && this.camera.weapons.ammo > 0) {
            this.camera.weapons.shoot()
            this.input.justShot = true
        }
        this.camera.weapons.update(deltaTime)
        this.camera.weapons.updateBuffers()
        this.camera.weapons.draw(this.textureProgram.info, this.camera.projectionMatrix)

        this.gl.bindTexture(this.gl.TEXTURE_2D, Wall.webglTexture);
        for (let wall of this.level.walls) {
            wall.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, Door.webglTexture);
        for (let door of this.level.doors) {
            door.update(deltaTime)
            door.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, Enemy.webglTexture);
        const shapeLookedAt = this.camera.raycast(this.level.collidingCuboids)
        if (this.camera.weapons.currentWeapon.justShot) {
            this.camera.weapons.decreaseAmmo()
        }
        for (let enemy of this.level.enemies) {
            if (this.camera.isLookingAt(enemy)) {
                const enemyDistance = this.camera.transform.position.horizontalDistanceTo(enemy.transform.position)
                const shapeLookedAtDistance = this.camera.transform.position.horizontalDistanceTo(shapeLookedAt.transform.position)
                if (enemyDistance < shapeLookedAtDistance) {
                    if (this.camera.weapons.currentWeapon.justShot) {
                        const distance = this.camera.transform.position.horizontalDistanceTo(enemy.transform.position)
                        if (distance <= this.camera.weapons.currentWeapon.range) {
                            enemy.damage(this.camera.weapons.currentWeapon.damage)
                        }
                    }
                }
            }
            enemy.lookAtCamera(this.camera.transform.rotation.y)
            enemy.update(deltaTime)
            enemy.updateBuffers()
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