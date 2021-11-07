import FieldData from '../../common/FieldData';
import { degToRad, Vec3 } from './utils';
import Wall from './shapes/Wall'
import Enemy from './shapes/Enemy'
import Cuboid from './shapes/Cuboid';
import Door from './shapes/Door';
import Shape from './shapes/Shape';
import Interactable from './shapes/Interactable';

export default class Level {
    width: number
    height: number
    playerPosition: Vec3
    walls: Wall[] = []
    enemies: Enemy[] = []
    doors: Door[] = []
    collidingCuboids: Cuboid[] = []
    interactables: Interactable[] = []

    private readonly gl: WebGLRenderingContext
    private readonly gridSize = 64
    private fields: FieldData[]

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
    }

    load(level: number, callback?: () => void) {
        this.loadLevel(level, () => {
            this.applyGridSize()
            this.createObjects()
            callback?.()
        })
    }

    get verticesCount() {
        let count = 0
        count += this.walls.map(el => el.verticesCount).reduce((a, b) => a + b)
        count += this.enemies.map(el => el.verticesCount).reduce((a, b) => a + b)
        return count
    }

    private loadLevel(number: number, callback?: () => void) {
        import(`../levels/${number}.json`)
            .then(({ default: level }) => {
                this.width = level.width
                this.height = level.height
                this.fields = level.fields
                this.checkWallsDirections()
                this.changeWallsNeighboursTextures()
                callback?.()
            });
    }

    private checkWallsDirections() {
        for (let door of this.fields.filter(f => f.value == 'door')) {
            const horizontalNeighbours = this.fields.filter(f => f.y == door.y && (f.x == door.x + 1 || f.x == door.x - 1))
            const verticalNeighbours = this.fields.filter(f => f.x == door.x && (f.y == door.y + 1 || f.y == door.y - 1))
            if (horizontalNeighbours.length == 2 && verticalNeighbours.length == 0) {
                door.rotation = 0
            } else if (horizontalNeighbours.length == 0 && verticalNeighbours.length == 2) {
                door.rotation = 270
            }
        }
    }

    private changeWallsNeighboursTextures() {
        for (let door of this.fields.filter(f => f.value == 'door')) {
            for (let direction of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
                const neighbour = this.fields.find(f => {
                    return f.x == door.x + direction[0] && f.y == door.y + direction[1]
                })
                if (neighbour) {
                    neighbour.wallDirection = direction
                }
            }
        }
    }

    private applyGridSize() {
        for (let field of this.fields) {
            field.x *= this.gridSize
            field.y *= this.gridSize
        }
    }

    private createObjects() {
        const playerPositionData = this.fields.find(f => f.value == 'player')
        this.playerPosition = new Vec3(playerPositionData.x, 0, playerPositionData.y)

        this.walls = this.getLevelObjectsList('wall', Wall) as Wall[]
        this.enemies = this.getLevelObjectsList('enemy', Enemy) as Enemy[]
        this.doors = this.getLevelObjectsList('door', Door) as Door[]

        this.collidingCuboids.push(...this.walls)
        this.collidingCuboids.push(...this.doors)
        this.interactables.push(...this.doors)
        // this.doors[0].transform.position.x += 45
    }

    private getLevelObjectsList(value: string, SpecificShape: (typeof Shape)) {
        const objects: Shape[] = []
        for (let field of this.fields.filter(f => f.value == value)) {
            const shape = new SpecificShape(this.gl)
            shape.transform.position.x = field.x
            shape.transform.position.z = field.y
            if (field.rotation) {
                shape.transform.rotation.y = degToRad(field.rotation)
            }
            shape.setInitialState()
            if (field.wallDirection) {
                const wall = shape as Wall
                const textureToSet = 4
                if (field.wallDirection[0] == 0 && field.wallDirection[1] == -1) {
                    wall.setTexture(textureToSet, 0)
                }
                if (field.wallDirection[0] == 0 && field.wallDirection[1] == 1) {
                    wall.setTexture(textureToSet, 1)
                }
                if (field.wallDirection[0] == -1 && field.wallDirection[1] == 0) {
                    wall.setTexture(textureToSet, 3)
                }
                if (field.wallDirection[0] == 1 && field.wallDirection[1] == 0) {
                    wall.setTexture(textureToSet, 2)
                }
            }
            objects.push(shape)
        }
        return objects
    }
}