export default class Textures {
    private readonly gl: WebGLRenderingContext
    private textureToImageMap: Map<string, HTMLImageElement> = new Map()
    private textureToWebglTextureMap: Map<string, WebGLTexture> = new Map()

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
    }

    load(textures: string[], callback?: () => void) {
        this.loadHtmlImages(textures, htmlImages => {
            textures.forEach((texture, index) => {
                const webglTexture = this.gl.createTexture()
                this.gl.bindTexture(this.gl.TEXTURE_2D, webglTexture)
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
                this.textureToImageMap.set(texture, htmlImages[index])
                this.textureToWebglTextureMap.set(texture, webglTexture)
            })
            callback?.()
        })
    }

    getImage(texture: string) {
        return this.textureToImageMap.get(texture)
    }

    getTexture(texture: string) {
        return this.textureToWebglTextureMap.get(texture)
    }

    useTexture(texture: string) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(texture))
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.getImage(texture))
        this.gl.generateMipmap(this.gl.TEXTURE_2D)
    }

    private loadHtmlImages(urls: string[], callback: (images: HTMLImageElement[]) => void) {
        let images: HTMLImageElement[] = []
        let imagesToLoad = urls.length

        const onImageLoad = () => {
            if (--imagesToLoad == 0) {
                callback(images)
            }
        }

        for (let i = 0; i < imagesToLoad; i++) {
            const image = new Image()
            image.src = urls[i]
            images.push(image)
            image.onload = onImageLoad
        }
    }
}