import { EvalDevToolModulePlugin } from "webpack"
import FieldData from "../../common/FieldData"
import NotCollidingFieldValues from "../../common/NotCollidingFieldValues"
import Config from "./Config"
import Level from "./Level"
import { log, Vec2, Vec3 } from "./utils"

export default class Pathfinder {
    static instance = new this

    private allSubFieldsCreated: PathField[] = []
    private envFields: FieldData[] = []

    private open: PathField[] = []
    private closed: PathField[] = []

    private readonly subdivisions = 3

    get subGridSize() {
        return Config.gridSize / this.subdivisions
    }

    prepareLevel(level: Level) {
        this.envFields = level.gridFields
        this.allSubFieldsCreated = []
    }

    private isSubFieldPosWalkable(position: Vec2) {
        const gridPos = this.subGridPosToGridPos(position)
        const envField = this.envFields.find(f => new Vec2(f.x, f.y).equals(gridPos))
        return !envField || NotCollidingFieldValues.includes(envField.value) || envField.value.toLowerCase().includes('door')
    }

    private subGridPosToGridPos(pos: Vec2) {
        return pos.map(v => Math.floor(v / this.subdivisions))
    }

    private realVec3ToSubGridVec2(v: Vec3) {
        const gridPosVec3 = v.map(v => Math.floor(v / this.subGridSize))
        const gridPosVec2 = new Vec2(gridPosVec3.x, gridPosVec3.z)
        return gridPosVec2
    }

    getAllPathLocations(from: Vec3, to: Vec3) {
        const subGridFrom = this.realVec3ToSubGridVec2(from)
        const subGridTo = this.realVec3ToSubGridVec2(to)
        const subGridPath = this._getAllPathfindLocations(subGridFrom, subGridTo)

        const realPath = subGridPath.map(subGridField => this.subGridVec2ToRealVec3(subGridField.position))
        return realPath
    }

    private subGridVec2ToRealVec3(v: Vec2) {
        const realPosVec2 = v.map(v => v * this.subGridSize + this.subGridSize / 2)
        const gridPosVec3 = new Vec3(realPosVec2.x, 0, realPosVec2.y)
        return gridPosVec3
    }

    private _getAllPathfindLocations(subGridFrom: Vec2, subGridTo: Vec2) {
        this.open = []
        this.closed = []

        const startField = new PathField(subGridFrom, true)
        this.open.push(startField)

        const endField = new PathField(subGridTo, this.isSubFieldPosWalkable(subGridTo))
        if (!endField.walkable) {
            return []
        }

        while (true) {
            if (this.open.length == 0) {
                return []
            }
            const current = this.leastFCostField()
            if (current.position.equals(endField.position)) {
                if (startField.position.equals(endField.position)) {
                    return []
                } else {
                    return this.getPathUsingParents(current)
                }
            } else {
                const validNeighbours = this.getValidNeighbours(current)
                for (let neighbour of validNeighbours) {
                    this.calculateCost(neighbour, current, endField)
                }
            }
        }
    }

    private leastFCostField() {
        const current = this.open.reduce((acc, loc) => acc.fCost < loc.fCost ? acc : loc)
        this.open = this.open.filter(field => field != current)
        this.closed.push(current)
        return current
    }

    private calculateCost(neighbour: PathField, current: PathField, endField: PathField) {
        if (!this.open.includes(neighbour) || neighbour.gCostWithParent(current) < neighbour.gCost) {
            neighbour.parent = current
            const hDiff = endField.position.substract(neighbour.position).abs
            neighbour.hCost = (hDiff.x + hDiff.y) * 10
            if (this.open.every(f => !f.position.equals(neighbour.position))) {
                this.open.push(neighbour)
            }
        }
    }

    private getValidNeighbours(field: PathField) {
        const neighbourDiffs = [
            new Vec2(-1, -1),
            new Vec2(-1, 0),
            new Vec2(-1, 1),
            new Vec2(0, -1),
            new Vec2(0, 1),
            new Vec2(1, -1),
            new Vec2(1, 0),
            new Vec2(1, 1),
        ]
        const neighbourPositions = neighbourDiffs.map(diff => field.position.add(diff))
        const neighbours = neighbourPositions.map(neighbourPos => {
            const subFieldAlreadyCreated = this.allSubFieldsCreated.find(field => field.position.equals(neighbourPos))
            if (subFieldAlreadyCreated) {
                return subFieldAlreadyCreated
            } else {
                const subField = new PathField(neighbourPos, this.isSubFieldPosWalkable(neighbourPos))
                this.allSubFieldsCreated.push(subField)
                return subField
            }
        })
        const validNeighbours = neighbours
            .filter(f => f.walkable && !this.closed.includes(f))
        // .filter(f => {
        //     const diff = f.position.substract(field.position)
        //     if (diff.x && diff.y) {
        //         const possibleCorners = [
        //             new Vec2(f.position.x, field.position.y),
        //             new Vec2(field.position.x, f.position.y),
        //         ]
        //         return possibleCorners.every(pos => this.isSubFieldPosWalkable(pos))
        //     }
        // })
        return validNeighbours
    }

    private getPathUsingParents(end: PathField) {
        let path = []
        path.push(end)
        while (end.parent) {
            end = end.parent
            path.push(end)
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
        if (this.parent) {
            return this.gCostWithParent(this.parent)
        } else {
            return 0
        }
    }

    gCostWithParent(parent: PathField) {
        const diff = parent.position.substract(this.position)
        if (diff.x && diff.y) {
            return parent.gCost + 14
        } else {
            return parent.gCost + 10
        }
    }

    get fCost() {
        return this.gCost + this.hCost
    }

    constructor(position: Vec2, walkable: boolean) {
        this.position = position
        this.walkable = walkable
    }
}