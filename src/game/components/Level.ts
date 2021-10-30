import FieldData from '../../common/FieldData';
import Wall from './shapes/Wall'
import Enemy from './shapes/Enemy'
import { Vec3 } from './utils';

export default class Level {
    width: number
    height: number
    walls: Wall[] = []
    enemies: Enemy[] = []
    playerPosition: Vec3

    private readonly gl: WebGLRenderingContext
    private readonly gridSize = 50
    private fields: FieldData[]

    constructor(gl: WebGLRenderingContext, afterLoad?: () => void) {
        this.gl = gl

        this.loadLevel(1, () => {
            this.applyGridSize()
            this.createObjects()
            afterLoad?.()
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
                callback?.()
            });
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
    }

    private getLevelObjectsList(value: string, ObjectClass: new (gl: WebGLRenderingContext) => (Wall | Enemy)) {
        const objects: (Wall | Enemy)[] = []
        for (let field of this.fields.filter(f => f.value == value)) {
            const object = new ObjectClass(this.gl)
            object.transform.position.x = field.x
            object.transform.position.z = field.y
            objects.push(object)
        }
        return objects
    }
}