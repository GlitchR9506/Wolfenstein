export default class WeaponData {
    type: string
    fireRate: number
    initTextures: number[]
    loopTextures: number[]

    constructor(
        type: string,
        fireRate: number,
        initTextures: number[],
        loopTextures: number[],
    ) {
        this.type = type
        this.fireRate = fireRate
        this.initTextures = initTextures
        this.loopTextures = loopTextures
    }

    get isAutomatic() {
        return this.loopTextures.length > 0
    }
}