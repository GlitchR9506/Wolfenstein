import FieldData from '../../../../common/FieldData'
import texture from '../../../textures/guard.png'
import Camera from '../../Camera'
import Config from '../../Config'
import Pathfinder from '../../Pathfinder'
import { Program } from '../../programs/Program'
import Raycaster from '../../Raycaster'
import { degToRad, log, radToDeg, Vec2, Vec3 } from '../../utils'
import UI from '../ui/UI'
import Ammo from './pickups/Ammo'
import Flag from './pickups/Flag'
import Plane from './Plane'
import Shape from './Shape'

export default class Enemy extends Plane {
    importedTexture = texture
    loot: Ammo
    noticeDistance = Config.gridSize * 5
    tempFlag: Flag
    tempFlagLocations: Vec3[] = []
    score = 100
    dir: Vec3 = Vec3.zero
    textureRotation = 0
    shootingDistance = Config.gridSize * 5
    damageDealed = 8

    constructor(gl: WebGLRenderingContext, program: Program) {
        super(gl, program)
        this.loot = new Ammo(this.gl, program)
        this.tempFlag = new Flag(this.gl, program)
        this.tempFlag.setInitialState()
        this.transform.rotation.x = degToRad(90)
    }

    get isDead() {
        return this.hp <= 0
    }


    private textureNumber: number
    state = 'walking'
    readonly stateToTextureMap = new Map([
        ['shooting', [48, 49, 50]],
        ['standing', [0]],
        ['walking', [8, 16, 24, 32]],
        ['dying', [40, 41, 42, 43, 44]],
        ['hit', [47, 0]],
        ['dead', [44]],
    ])

    readonly frameTime = 0.2

    timeSinceLastUpdate = 0
    update(deltaTime: number, camera: Camera) {
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
                } else if (this.state == 'hit') {
                    this.state = 'walking'
                } else {
                    this.setTexture(textures[0])
                }
            }
            if (this.state == "shooting" && index == textures.length - 1) {
                if (UI.instance.health > 0) {
                    UI.instance.health -= this.damageDealed
                    if (UI.instance.health <= 0) {
                        UI.instance.health = 0
                        UI.instance.deadScreen()
                        camera.killer = this
                    }
                }
            }
        }
        this.updateBuffers()
    }

    hp = 100
    damage(value: number) {
        if (['dying', 'dead'].includes(this.state)) return
        this.hp -= value
        this.state = 'hit'
        if (this.hp <= 0) {
            this.hp = 0
            this.state = 'dying'
        }
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }

    texturedWidth = 28 / 64

    texturesInLine = 8
    get textureSize() {
        return 1 / this.texturesInLine
    }

    setTexture(textureNumber: number) {
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

    inNoticeDistance(camera: Camera) {
        return this.transform.position.horizontalDistanceTo(camera.transform.position) <= this.noticeDistance
    }

    followingPlayer: Camera
    followingSpeed = Config.gridSize * 1.25

    pathfind(destination: Vec3) {

    }

    makeStep(deltaTime: number) {
        if (this.followingPlayer) {
            this.tempFlagLocations = Pathfinder.instance.getAllPathLocations(this.transform.position, this.followingPlayer.transform.position)
            this.tempFlagLocations = this.tempFlagLocations.map(v => new Vec3(v.x, -30, v.z))
            if (this.tempFlagLocations.length == 0) return
            this.dir = this.tempFlagLocations[0].substract(this.transform.position).yZeroed.normalize

            this.transform.position = this.transform.position.add(this.dir.multiply(this.followingSpeed * deltaTime))
            // this.followingPlayer = null
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
    }

    tryToShoot(camera: Camera, shapes: Shape[]) {
        if (this.transform.position.distanceTo(camera.transform.position) <= this.shootingDistance) {
            this.state = "shooting"
            const raycaster = Raycaster.fromTo(this.transform.position, camera.transform.position)
            const nextShape = raycaster.nextShape(shapes)
            const target = camera.transform.position.yZeroed
            if (nextShape.transform.position.yZeroed.distanceTo(target) > this.transform.position.yZeroed.distanceTo(target)) {
                return true
            }
        }
        this.state = "walking"
        return false
    }
}