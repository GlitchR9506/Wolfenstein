export type weaponType = "knife" | "pistol" | "machinegun" | "chaingun"

export class Weapon {
    type: weaponType
    fireRate: number
    initTextures: number[]
    loopTextures: number[]
    shootTexture: number

    range: number = 1000000

    shooting = false
    willShoot = false
    justShot = false

    private textureIndex: number = 0
    private currentTextures: number[]

    constructor(
        type: weaponType,
        fireRate: number,
        initTextures: number[],
        loopTextures: number[],
        shootTexture: number,
    ) {
        this.type = type
        this.fireRate = fireRate
        this.initTextures = initTextures
        this.loopTextures = loopTextures
        this.shootTexture = shootTexture

        this.currentTextures = initTextures
    }

    get isAutomatic() {
        return this.loopTextures.length > 0
    }

    get isTextureLastInit() {
        return this.textureIndex
    }

    get framesCount() {
        if (this.isAutomatic) {
            return this.loopTextures.length
        } else {
            return this.initTextures.length
        }
    }

    getNextTexture() {
        this.justShot = false
        if (!this.isAutomatic) {
            if (this.willShoot) {
                return this.getNextShootingTexture()
            } else {
                return this.initTextures[0]
            }
        } else {
            if (this.shooting) {
                return this.getNextShootingTexture()
            } else {
                return this.getNextStoppedShootingTexture()
            }
        }
    }

    getNextShootingTexture() {
        this.textureIndex++
        if (this.textureIndex >= this.currentTextures.length) {
            if (this.currentTextures == this.initTextures && this.isAutomatic) {
                this.currentTextures = this.loopTextures
            } else {
                this.willShoot = false
            }
            this.textureIndex = 0
        }
        const texture = this.currentTextures[this.textureIndex]
        if (texture == this.shootTexture) {
            this.justShot = true
        }
        return texture
    }

    getNextStoppedShootingTexture() {
        if (this.currentTextures == this.loopTextures) {
            this.currentTextures = this.initTextures
            this.textureIndex = this.initTextures.length - 1
        }
        let texture = this.currentTextures[this.textureIndex]
        this.textureIndex--
        if (this.textureIndex < 0) {
            this.textureIndex = 0
        }
        return texture
    }
}