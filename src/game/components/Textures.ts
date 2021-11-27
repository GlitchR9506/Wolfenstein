import Shape from "./shapes/Shape"

export default class Textures {
    private readonly gl: WebGLRenderingContext

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
    }

    load(textureObjectsClasses: (typeof Shape)[], callback?: () => void) {
        const textures = textureObjectsClasses.map(el => el.importedTexture)
        this.loadHtmlImages(textures, htmlImages => {
            textures.forEach((texture, index) => {
                const webglTexture = this.gl.createTexture()
                this.gl.bindTexture(this.gl.TEXTURE_2D, webglTexture)
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_LINEAR)
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, htmlImages[index])
                this.gl.generateMipmap(this.gl.TEXTURE_2D)
                textureObjectsClasses[index].webglTexture = webglTexture
            })
            callback?.()
        })
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

    bind(className: (typeof Shape)) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, className.webglTexture);
    }
}