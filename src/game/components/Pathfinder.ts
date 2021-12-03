import FieldData from "../../common/FieldData"
import Config from "./Config"
import { log, Vec2, Vec3 } from "./utils"

export default class Pathfinder {
    static instance = new this

    maxIterations = 100
    checkedFields: Vec2[] = []

    constructor() {

    }

    realVec3ToGridVec2(v: Vec3) {
        const gridPosVec3 = v.map(v => Math.floor(v / Config.gridSize))
        const gridPosVec2 = new Vec2(gridPosVec3.x, gridPosVec3.z)
        return gridPosVec2
    }

    gridVec2ToRealVec3(v: Vec2) {
        const realPosVec2 = v.map(v => v * Config.gridSize + Config.gridSize / 2)
        const gridPosVec3 = new Vec3(realPosVec2.x, 0, realPosVec2.y)
        return gridPosVec3
    }

    getAllPathfindLocations(from: Vec3, to: Vec3, fields: FieldData[]) {
        this.checkedFields = []

        const gridFrom = this.realVec3ToGridVec2(from)
        const gridTo = this.realVec3ToGridVec2(to)

        // let gridLocations = [gridFrom]
        let gridLocations = []
        let gridLocation
        let iteration = 0

        console.trace('źle')
        do {
            // console.log(iteration, iteration == 0 ? gridFrom : gridLocations[gridLocations.length - 1])
            gridLocation = this.getBestField(iteration == 0 ? gridFrom : gridLocations[gridLocations.length - 1], gridTo, fields, iteration)
            if (gridLocation) {
                gridLocations.push(gridLocation)
            }
            iteration++
        } while (gridLocation && !gridLocation.equals(gridTo) && iteration < this.maxIterations)

        if (gridLocation && gridLocation.equals(gridTo)) {
            const realLocations = gridLocations.map(location => this.gridVec2ToRealVec3(location))
            return realLocations
        } else {
            return []
        }
    }

    getBestField(gridFrom: Vec2, gridPosTo: Vec2, fields: FieldData[], iteration: number) {
        const gridPosDiffs = [
            new Vec2(0, -1),
            new Vec2(0, 1),
            new Vec2(-1, 0),
            new Vec2(1, 0),
        ]
        const gridPositionsWithDiffs = gridPosDiffs.map(diff => gridFrom.add(diff))

        let availableNextFields = []
        for (let nextFieldsCandidate of gridPositionsWithDiffs) {
            let alreadyChecked = false
            for (let checkedField of this.checkedFields) {
                if (nextFieldsCandidate.equals(checkedField)) {
                    alreadyChecked = true
                }
            }
            if (!alreadyChecked) {
                availableNextFields.push(nextFieldsCandidate)
            }
        }
        availableNextFields = availableNextFields
            .filter(candidate => {
                const fieldWithDiff = fields.find(field => field.x == candidate.x && field.y == candidate.y)
                return !fieldWithDiff || fieldWithDiff.value != 'wall'
            })

        if (!availableNextFields) return
        let bestScore
        let fieldWithBestScore = availableNextFields[0]
        for (let availableNextField of availableNextFields) {
            const distFromStart = iteration + 1
            const toEndVec = gridPosTo.substract(availableNextField).abs
            const distToEnd = toEndVec.x + toEndVec.y
            const score = distFromStart + distToEnd
            if (!bestScore || score < bestScore) {
                bestScore = score
                fieldWithBestScore = availableNextField
            }
            this.checkedFields.push(availableNextField)
        }
        return fieldWithBestScore
    }
}