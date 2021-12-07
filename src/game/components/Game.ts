import { ColorProgram } from './programs/ColorProgram'
import { TextureProgram } from './programs/TextureProgram'

import { degToRad, log, m4, radToDeg, Vec3 } from './utils'
import Camera from './Camera'
import Input from './Input'
import Textures from './Textures'

import Level from './Level'

import Crosshair from './shapes/ui/Crosshair'
import Interactable from './shapes/level/Interactable'
import Shape from './shapes/level/Shape'
import Config from './Config'
import UI from './shapes/ui/UI'
import { GridBoundingBox } from './shapes/level/GridBoundingBox'


export default class Game {
    private readonly colorProgram: ColorProgram
    private readonly textureProgram: TextureProgram
    private readonly camera: Camera
    private readonly textures: Textures
    private readonly level: Level
    private readonly crosshair: Crosshair
    private readonly fixedUpdateInterval = 20
    private gl: WebGLRenderingContext
    private canvas: HTMLCanvasElement

    constructor() {

        this.initWebgl()
        this.colorProgram = new ColorProgram(this.gl)
        this.textureProgram = new TextureProgram(this.gl)

        this.camera = new Camera(this.gl, this.textureProgram)
        this.camera.updateProjectionMatrix()
        this.textures = new Textures(this.gl)
        this.level = new Level(this.gl, this.textureProgram, this.colorProgram)
        this.crosshair = new Crosshair(this.gl, this.colorProgram)
        this.level.load(1, () => {
            let shapes = []
            shapes.push(this.camera.weapons)
            shapes.push(...this.level.enemies.map(enemy => enemy.loot))
            shapes.push(...this.level.enemies.map(enemy => enemy.tempFlag))
            shapes.push(...this.level.shapes)
            this.textures.load(shapes, () => {
                this.camera.transform.position = this.level.playerPosition
                this.camera.collidingShapes = [...this.level.collidingCuboids, ...this.level.decorations.filter(decoration => decoration.bb)]
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

        const fixedDeltaTime = this.fixedUpdateInterval * 0.001
        setInterval(() => {
            this.fixedUpdate(fixedDeltaTime)
        }, this.fixedUpdateInterval)
    }

    private fixedUpdate(deltaTime: number) {
        if (Input.instance.interacting) {
            const nearestInteractable = this.camera.nearest(this.level.interactables) as Interactable
            if (this.camera.inInteractionDistance(nearestInteractable)) {
                nearestInteractable.interact()
                Input.instance.justInteracted = true
            }
        }

        this.camera.update(deltaTime)

        for (let pickup of this.level.pickups.filter(pickup => !pickup.pickedUp)) {
            if (this.camera.transform.position.horizontalDistanceTo(pickup.transform.position) <= pickup.pickupRange) {
                pickup.pickUp(this.camera)
            }
        }

        this.camera.weapons.update(deltaTime)

        for (let door of this.level.doors) {
            door.update(deltaTime)
        }

        const shapeLookedAt = this.camera.raycast(this.level.collidingCuboids)
        for (let enemy of this.level.enemies) {
            enemy.update(deltaTime)
            if (this.camera.isLookingAt(enemy) && shapeLookedAt) {
                const enemyDistance = this.camera.transform.position.horizontalDistanceTo(enemy.transform.position)
                const shapeLookedAtDistance = this.camera.transform.position.horizontalDistanceTo(shapeLookedAt.transform.position)
                if (enemyDistance < shapeLookedAtDistance) {
                    if (this.camera.weapons.currentWeapon.justShot) {
                        const distance = this.camera.transform.position.horizontalDistanceTo(enemy.transform.position)
                        if (distance <= this.camera.weapons.currentWeapon.range && !enemy.isDead) {
                            enemy.damage(this.camera.weapons.currentWeapon.damage)
                            UI.instance.score += enemy.score
                        }
                        if (enemy.isDead) {
                            this.level.spawnLoot(enemy)
                        }
                    }
                }
            }
            if (enemy.isDead) {
                enemy.followingPlayer = null
            } else {
                if (enemy.inNoticeDistance(this.camera) && this.camera.weapons.currentWeapon.justShot) {
                    enemy.followingPlayer = this.camera
                }
            }
            if (enemy.followingPlayer) {
                enemy.makeStep(deltaTime, this.level.gridFields)
            }
        }
    }

    private draw(deltaTime: number) {
        this.setDrawSettings()

        this.crosshair.draw(this.camera.projectionMatrix)
        this.level.floor.draw(this.camera.viewProjectionMatrix)
        this.level.ceiling.draw(this.camera.viewProjectionMatrix)

        for (let pickup of this.level.pickups.filter(pickup => !pickup.pickedUp)) {
            pickup.lookAtCamera(this.camera.transform.rotation.y)
            pickup.draw(this.camera.viewProjectionMatrix)
        }

        for (let decoration of this.level.decorations) {
            decoration.lookAtCamera(this.camera.transform.rotation.y)
            decoration.draw(this.camera.viewProjectionMatrix)
        }

        this.camera.weapons.draw(this.camera.projectionMatrix)

        if (Input.instance.renderWalls) {
            for (let wall of this.level.walls) {
                wall.draw(this.camera.viewProjectionMatrix)
            }
        }

        for (let door of this.level.doors) {
            door.draw(this.camera.viewProjectionMatrix)
        }

        for (let enemy of this.level.enemies) {
            enemy.lookAtCamera(this.camera.transform.rotation.y)
            enemy.draw(this.camera.viewProjectionMatrix)
            for (let location of enemy.tempFlagLocations) {
                enemy.tempFlag.transform.position = location
                enemy.tempFlag.lookAtCamera(this.camera.transform.rotation.y)
                enemy.tempFlag.draw(this.camera.viewProjectionMatrix)
            }
        }
        UI.instance.draw(this.canvas)
    }

    private initWebgl() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement
        this.canvas.width = 608 * Config.uiScale
        this.canvas.height = 304 * Config.uiScale;

        UI.instance.init();

        this.gl = this.canvas.getContext("webgl")

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
        // this.resizeCanvasToDisplaySize(this.gl.canvas)

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        Input.instance.update()
    }

    // private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    //     const displayWidth = canvas.clientWidth
    //     const displayHeight = canvas.clientHeight

    //     const resizeNeeded = canvas.width !== displayWidth || canvas.height !== displayHeight

    //     if (resizeNeeded) {
    //         // canvas.width = displayWidth
    //         // canvas.height = displayHeight
    //         // this.camera.updateProjectionMatrix()
    //     }

    //     return resizeNeeded
    // }
}