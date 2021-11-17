export default class WeaponData {
    type: string
    fireRate: number
    initTextures: number[]
    loopTextures: number[]

    shooting = false
    willShoot = false

    private textureIndex: number = 0
    private currentTextures: number[]

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
        if (!this.isAutomatic) {
            if (this.willShoot) {
                let texture = this.getNextShootingTexture()
                if (this.currentTextures == this.initTextures && this.textureIndex == this.initTextures.length - 1) {
                    this.willShoot = false
                }
                return texture
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
            }
            this.textureIndex = 0
        }
        const texture = this.currentTextures[this.textureIndex]
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