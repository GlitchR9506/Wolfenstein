import FieldData from '../../common/FieldData';
import { degToRad, Vec3 } from './utils';
import Wall from './shapes/Wall'
import Enemy from './shapes/Enemy'
import Cuboid from './shapes/Cuboid';
import Door from './shapes/Door';
import Plane from './shapes/Plane';
import Shape from './shapes/Shape';
import Interactable from './shapes/Interactable';

import Pickup from './shapes/pickups/Pickup';
import Ammo from './shapes/pickups/Ammo'

import Config from './Config'
import { TextureProgram } from './programs/TextureProgram';
import { ColorProgram } from './programs/ColorProgram';
import { Program } from './programs/Program';

export default class Level {
    width: number
    height: number
    center: Vec3
    playerPosition: Vec3
    walls: Wall[] = []
    enemies: Enemy[] = []
    doors: Door[] = []
    shapes: Shape[] = []
    floor: Plane
    ceiling: Plane
    collidingCuboids: Cuboid[] = []
    interactables: Interactable[] = []
    textureProgram: TextureProgram
    colorProgram: ColorProgram
    pickups: Pickup[] = []

    private readonly gl: WebGLRenderingContext
    private fields: FieldData[]

    constructor(gl: WebGLRenderingContext, textureProgram: TextureProgram, colorProgram: ColorProgram) {
        this.gl = gl
        this.textureProgram = textureProgram
        this.colorProgram = colorProgram
    }

    load(level: number, callback?: () => void) {
        this.loadLevel(level, () => {
            this.applyGridSize()
            this.createObjects()
            callback?.()
        })
    }

    spawnLoot(enemy: Enemy) {
        if (enemy.loot) {
            this.pickups.push(enemy.loot)
            enemy.loot.transform.position = enemy.transform.position.clone()
            // enemy.loot.transform.position.x += 30
            // enemy.loot.transform.position.z += 30
            enemy.loot.setInitialState()

        }
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
                this.center = new Vec3(this.width * Config.gridSize / 2, 0, this.height * Config.gridSize / 2)
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
            field.x = (field.x * Config.gridSize) + Config.gridSize / 2
            field.y = (field.y * Config.gridSize) + Config.gridSize / 2
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

        this.floor = new Plane(this.gl, this.colorProgram)
        this.floor.setColor("#707070")
        this.floor.transform.position = this.center.clone()
        this.floor.transform.position.y = -Config.gridSize / 2
        this.floor.transform.scale.set(this.width * Config.gridSize, 1, this.height * Config.gridSize)

        this.ceiling = new Plane(this.gl, this.colorProgram)
        this.ceiling.setColor("#383838")
        this.ceiling.transform.position = this.center.clone()
        this.ceiling.transform.position.y = Config.gridSize / 2
        this.ceiling.transform.scale.set(this.width * Config.gridSize, 1, this.height * Config.gridSize)
        this.ceiling.transform.rotation.z = degToRad(180)

        this.shapes = [
            ...this.walls,
            ...this.enemies,
            ...this.doors,
            ...this.pickups,
            this.floor,
            this.ceiling,
        ]
    }

    private getLevelObjectsList<T extends Shape>(value: string, SpecificShape: new (gl: WebGLRenderingContext, program: Program) => T) {
        const objects: Shape[] = []
        for (let field of this.fields.filter(f => f.value == value)) {
            const shape = new SpecificShape(this.gl, this.textureProgram)
            shape.transform.position.x = field.x
            shape.transform.position.z = field.y
            if (field.rotation) {
                shape.transform.rotation.y = degToRad(field.rotation)
            }
            shape.setInitialState()
            if (field.wallDirection && shape instanceof Wall) {
                const wall = shape
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