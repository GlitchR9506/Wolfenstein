import { EvalDevToolModulePlugin } from "webpack"
import FieldData from "../../common/FieldData"
import NotCollidingFieldValues from "../../common/NotCollidingFieldValues"
import Config from "./Config"
import Level from "./Level"
import { log, Vec2, Vec3 } from "./utils"

export default class Pathfinder {
    static instance = new this

    allFields: PathField[] = []
    envFields: FieldData[] = []

    open: PathField[] = []
    closed: PathField[] = []

    prepareLevel(level: Level) {
        this.envFields = level.gridFields

        this.allFields = []
        for (let x = 0; x < level.width; x++) {
            for (let y = 0; y < level.height; y++) {
                const pos = new Vec2(x, y)
                const field = new PathField(pos, level.gridFields)
                this.allFields.push(field)
            }
        }
    }

    private realVec3ToGridVec2(v: Vec3) {
        const gridPosVec3 = v.map(v => Math.floor(v / Config.gridSize))
        const gridPosVec2 = new Vec2(gridPosVec3.x, gridPosVec3.z)
        return gridPosVec2
    }

    getAllPathLocations(from: Vec3, to: Vec3) {
        const gridFrom = this.realVec3ToGridVec2(from)
        const gridTo = this.realVec3ToGridVec2(to)

        const gridPath = this._getAllPathfindLocations(gridFrom, gridTo)

        const realPath = gridPath.map(pathField => this.gridVec2ToRealVec3(pathField.position))
        return realPath
    }

    private gridVec2ToRealVec3(v: Vec2) {
        const realPosVec2 = v.map(v => v * Config.gridSize + Config.gridSize / 2)
        const gridPosVec3 = new Vec3(realPosVec2.x, 0, realPosVec2.y)
        return gridPosVec3
    }

    private _getAllPathfindLocations(gridFrom: Vec2, gridTo: Vec2) {
        this.open = []
        this.closed = []

        const startField = new PathField(gridFrom, this.envFields)
        // const startField = this.allFields.find(field => field.position.equals(gridFrom))
        this.open.push(startField)

        const endField = this.allFields.find(field => field.position.equals(gridTo))

        while (true) {
            if (this.open.length == 0) {
                return []
            }
            let current = this.open.reduce((acc, loc) => acc.fCost < loc.fCost ? acc : loc)
            this.open = this.open.filter(field => field != current)
            this.closed.push(current)
            if (current.position.equals(endField.position)) {
                return this.path(endField)
            } else {
                const neighbourDiffs = [
                    new Vec2(0, -1),
                    new Vec2(0, 1),
                    new Vec2(-1, 0),
                    new Vec2(1, 0),
                ]
                const neighbourPositions = neighbourDiffs.map(diff => current.position.add(diff))
                const neighbours = neighbourPositions.map(neighbourPos => this.allFields.find(field => field.position.equals(neighbourPos)))
                const validNeighbours = neighbours.filter(field => field.walkable && !this.closed.includes(field))
                for (let neighbour of validNeighbours) {
                    const hDiff = endField.position.substract(neighbour.position).abs
                    const newHCost = hDiff.x + hDiff.y
                    if (!this.open.includes(neighbour) || newHCost < neighbour.hCost) {
                        neighbour.parent = current
                        neighbour.hCost = newHCost
                        if (!this.open.includes(neighbour)) {
                            this.open.push(neighbour)
                        }
                    }
                }
            }
        }
    }

    path(toReturn: PathField) {
        let path = []
        path.push(toReturn)
        while (toReturn.parent) {
            toReturn = toReturn.parent
            path.push(toReturn)
        }
        path.reverse()
        path.shift()
        return path
    }
}

class PathField {
    position: Vec2
    walkable: boolean

    parent: PathField
    hCost: number

    get gCost(): number {
        return this.parent ? this.parent.gCost + 10 : 0
    }

    get fCost() {
        return this.gCost + this.hCost
    }

    constructor(position: Vec2, envFields: FieldData[]) {
        this.position = position
        this.setWalkable(envFields)
    }

    private setWalkable(envFields: FieldData[]) {
        const envField = envFields.find(f => new Vec2(f.x, f.y).equals(this.position))
        this.walkable = !envField || NotCollidingFieldValues.includes(envField.value) || envField.value.toLowerCase().includes('door')
    }
}