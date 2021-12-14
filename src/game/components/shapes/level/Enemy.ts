import FieldData from '../../../../common/FieldData'
import texture from '../../../textures/guard.png'
import BetterAudio from '../../BetterAudio'
import Camera from '../../Camera'
import Config from '../../Config'
import Pathfinder from '../../Pathfinder'
import { PathfinderFieldData } from '../../Pathfinder'
import { Program } from '../../programs/Program'
import Raycaster from '../../Raycaster'
import { degToRad, log, radToDeg, Vec2, Vec3 } from '../../utils'
import UI from '../ui/UI'
import Door from './Door'
import Ammo from './pickups/Ammo'
import Flag from './pickups/Flag'
import Plane from './Plane'
import Shape from './Shape'
import audioShot from "../../../sounds/Pistol.wav"
import audioPain from "../../../sounds/Enemy Pain.wav"
import audioDeath1 from "../../../sounds/Death 1.wav"
import audioDeath2 from "../../../sounds/Death 2.wav"

export default class Enemy extends Plane {
    loot: Ammo
    tempFlag: Flag
    pathfinderFields: PathfinderFieldData[] = []
    score = 100
    followingPlayer: Camera
    importedTexture = texture
    texturedWidth = 28 / 64

    private textureRotation = 0
    private texturesInLine = 8
    private textureNumber: number
    private readonly stateToTextureMap = new Map([
        ['shooting', [48, 49, 50]],
        ['standing', [0]],
        ['walking', [8, 16, 24, 32]],
        ['dying', [40, 41, 42, 43, 44]],
        ['hit', [47, 0]],
        ['dead', [44]],
    ])

    shotNoticeDistance = Config.gridSize * 10
    private dir = Vec3.zero
    private shootingDistance = Config.gridSize * 5
    private damageDealed = 8
    private walkingDirection = Vec3.zero
    state = 'standing'
    private timeSinceLastUpdate = 0
    private hp = 100
    private followingSpeed = Config.gridSize * 1.25
    private nextDir: Vec3 = null
    private timeSinceLastPathfinding = 0
    private readonly initialState
    private readonly pathfindingDelay = 0.5
    private readonly frameTime = 0.2
    private readonly audioPain = new BetterAudio(audioPain)
    private readonly audiosDeath = [new BetterAudio(audioDeath1), new BetterAudio(audioDeath2)]
    private readonly audioShot = new BetterAudio(audioShot)

    constructor(gl: WebGLRenderingContext, program: Program, type?: string) {
        super(gl, program)
        this.loot = new Ammo(this.gl, program)
        this.tempFlag = new Flag(this.gl, program)
        this.tempFlag.setInitialState()
        this.transform.rotation.x = degToRad(90)
        if (type == "x") {
            this.walkingDirection = Vec3.right
            this.state = "walking"
            this.dir = this.walkingDirection
        } else if (type == "z") {
            this.walkingDirection = Vec3.forward
            this.state = "walking"
            this.dir = this.walkingDirection
        } else if (type == "up") {
            this.dir = Vec3.forward
        } else if (type == "down") {
            this.dir = Vec3.backward
        } else if (type == "left") {
            this.dir = Vec3.left
        } else if (type == "right") {
            this.dir = Vec3.right
        }
        this.initialState = this.state
    }

    get isDead() {
        return this.hp <= 0
    }

    update(deltaTime: number, camera: Camera) {
        if (UI.instance.state == 'end') {
            this.followingPlayer = null
        } else {
            this.timeSinceLastUpdate += deltaTime
            const frameTime = this.state == "shooting" ? 0.3 : this.frameTime
            if (this.timeSinceLastUpdate > frameTime) {
                this.timeSinceLastUpdate = 0
                const textures = this.stateToTextureMap.get(this.state)
                const index = textures.indexOf(this.textureNumber) + 1
                if (index < textures.length) {
                    this.setTexture(textures[index])
                } else {
                    this.textureNumber = 0
                    if (this.state == 'dying') {
                        this.state = 'dead'
                        UI.instance.enemiesKilled++
                    } else if (this.state == 'hit') {
                        this.state = 'walking'
                    } else {
                        this.setTexture(textures[0])
                    }
                }
                if (this.state == "shooting" && index == textures.length - 1) {
                    if (UI.instance.health > 0) {
                        UI.instance.health -= this.damageDealed
                        UI.instance.flashRed()
                        this.audioShot.play()
                        camera.audioHit.play()
                        if (UI.instance.health <= 0) {
                            UI.instance.health = 0
                            camera.killer = this
                        }
                    }
                }
                if (this.followingPlayer && UI.instance.health == 0) {
                    this.followingPlayer = null
                    this.dir = this.transform.position.to(camera.transform.position)
                    this.state = "standing"
                }
            }
            this.updateBuffers()
        }
    }

    damage(value: number) {
        if (['dying', 'dead'].includes(this.state)) return
        this.hp -= value
        this.state = 'hit'
        if (this.hp <= 0) {
            this.hp = 0
            this.state = 'dying'
            this.audiosDeath[Math.floor(Math.random() * this.audiosDeath.length)].play()
        } else {
            this.audioPain.play()
        }
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }

    pathfind(destination: Vec3) {

    }

    makeStepTowardsPlayer(deltaTime: number, doors: Door[]) {
        this.timeSinceLastPathfinding += deltaTime
        if (this.followingPlayer) {
            if (this.timeSinceLastPathfinding >= this.pathfindingDelay) {
                this.timeSinceLastPathfinding = 0
                if (this.pathfinderFields.length <= 80) {
                    this.pathfinderFields = Pathfinder.instance.getAllPathLocations(this.transform.position, this.followingPlayer.transform.position)
                    this.pathfinderFields = this.pathfinderFields.map(v => {
                        return {
                            subGridPos: new Vec3(v.subGridPos.x, -30, v.subGridPos.z),
                            shape: v.shape,
                            realPos: v.realPos,
                        }
                    })
                } else {
                    this.state = "standing"
                    this.followingPlayer = null
                    this.pathfinderFields = []
                }
            }
            if (this.pathfinderFields.length <= 1) return
            this.dir = this.pathfinderFields[1].subGridPos.substract(this.transform.position).yZeroed.normalize
            for (let i = 1; i < 3; i++) {
                const futureField = this.pathfinderFields[i]
                if (futureField && futureField.shape == "door") {
                    const door = doors.find(d => d.initialTransform.position.yZeroed.equals(futureField.realPos.yZeroed))
                    if (door) {
                        if (door.canInteract) {
                            door.toggle()
                        }
                    }
                    break
                }
            }
            this.transform.position = this.transform.position.add(this.dir.multiply(this.followingSpeed * deltaTime))
            // this.followingPlayer = null
        }
    }

    makeStepIfWalking(deltaTime: number, shapes: Shape[]) {
        if (!this.followingPlayer && this.initialState == "walking" && this.state == "walking") {
            const raycaster = Raycaster.fromDir(this.transform.position, this.dir)
            const nextShape = raycaster.nextShape(shapes)
            if (nextShape) {
                const distance = this.transform.position.distanceTo(nextShape.transform.position)
                if (distance <= Config.gridSize && !this.nextDir) {
                    this.nextDir = this.dir.inverted
                    this.state = "standing"
                    setTimeout(() => {
                        this.dir = this.nextDir
                        setTimeout(() => {
                            this.state = "walking"
                            this.nextDir = null
                        }, 500)
                    }, 1000)
                }
                this.transform.position = this.transform.position.add(this.dir.multiply(this.followingSpeed * deltaTime))
            }
        }
    }

    rotateTexture(targetPosition: Vec3) {
        let toTargetDir = targetPosition.substract(this.transform.position).yZeroed.normalize
        let toTargetAngle = Math.atan2(toTargetDir.z, toTargetDir.x)
        let walkingAngle = Math.atan2(this.dir.z, this.dir.x)
        let angleDiff = radToDeg(walkingAngle - toTargetAngle)
        if (angleDiff > 180) angleDiff -= 360
        if (angleDiff < -180) angleDiff += 360
        const correctedDiff = angleDiff > 0 ? angleDiff + 22.5 : angleDiff - 22.5
        this.textureRotation = parseInt((correctedDiff / 45).toString())
        return angleDiff
    }

    canSee(target: Vec3, shapes: Shape[]) {
        const raycaster = Raycaster.fromTo(this.transform.position, target.yZeroed)
        const nextShape = raycaster.nextShape(shapes)
        if (!nextShape) return false
        return nextShape.transform.position.yZeroed.distanceTo(this.transform.position.yZeroed) > this.transform.position.yZeroed.distanceTo(target.yZeroed)
    }

    tryToShoot(camera: Camera, shapes: Shape[]) {
        if (this.state == 'dead' || this.state == "dying" || this.state == "hit" || !this.followingPlayer) return false
        if (UI.instance.health > 0) {
            if (
                this.transform.position.distanceTo(camera.transform.position) <= this.shootingDistance
                && this.canSee(camera.transform.position, shapes)
            ) {
                this.state = "shooting"
                return true
            } else {
                this.state = "walking"
                return false
            }
            // this.state = 'walking'
        } else {
            this.state = 'standing'
            this.followingPlayer = null
        }
        return false
    }

    private get textureSize() {
        return 1 / this.texturesInLine
    }

    private setTexture(textureNumber: number) {
        // if (textureNumber == this.textureNumber) {
        //     console.log('olewam', textureNumber)
        //     return

        // }
        this.textureNumber = textureNumber

        if (this.state == 'walking' || this.state == 'standing') {
            if (this.textureRotation >= 0) {
                textureNumber += this.textureRotation
            } else {
                textureNumber += this.textureRotation + this.texturesInLine
            }
        }

        let verticesVec2Array = Vec2.arrayToVec2Array(this.initialTexcoords)
        const texturePos = new Vec2(textureNumber % this.texturesInLine, Math.floor(textureNumber / this.texturesInLine)).multiply(this.textureSize)
        verticesVec2Array = verticesVec2Array.map(vertex => vertex.multiply(this.textureSize).add(texturePos))
        this.TEXCOORDS = new Float32Array(Vec2.vec2ArrayToArray(verticesVec2Array))
    }
}