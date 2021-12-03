import FieldData from '../../../../common/FieldData'
import texture from '../../../textures/guard.png'
import Camera from '../../Camera'
import Config from '../../Config'
import Pathfinder from '../../Pathfinder'
import { Program } from '../../programs/Program'
import { degToRad, log, Vec2, Vec3 } from '../../utils'
import Ammo from './pickups/Ammo'
import Flag from './pickups/Flag'
import Plane from './Plane'

export default class Enemy extends Plane {
    importedTexture = texture
    loot: Ammo
    noticeDistance = Config.gridSize * 5
    tempFlag: Flag
    tempFlagLocations: Vec3[] = []

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
        ['shooting', [0, 4, 8]],
        ['walking', [1, 5, 9, 13]],
        ['dying', [2, 6, 10, 14]],
        ['hit', [2, 1]],
        ['dead', [14]],
    ])

    readonly frameTime = 0.2

    timeSinceLastUpdate = 0
    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime
        if (this.timeSinceLastUpdate > this.frameTime) {
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

    texturesInLine = 4
    get textureSize() {
        return 1 / this.texturesInLine
    }

    setTexture(textureNumber: number) {
        if (textureNumber == this.textureNumber) return
        this.textureNumber = textureNumber
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

    makeStep(deltaTime: number, fields: FieldData[]) {
        if (this.followingPlayer) {
            // const dir = this.followingPlayer.transform.position.substract(this.transform.position).yZeroed.normalize

            this.tempFlagLocations = Pathfinder.instance.getAllPathfindLocations(this.transform.position, this.followingPlayer.transform.position, fields)
            if (this.tempFlagLocations.length == 0) return
            const dir = this.tempFlagLocations[0].substract(this.transform.position).yZeroed.normalize

            // log('current pos', this.transform.position)
            // log('flag pos', this.tempFlag.transform.position)

            this.transform.position = this.transform.position.add(dir.multiply(this.followingSpeed * deltaTime))
            // this.followingPlayer = null
        }
    }
}