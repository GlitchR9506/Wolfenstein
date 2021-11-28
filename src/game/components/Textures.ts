import Shape from "./shapes/level/Shape"

export default class Textures {
    private readonly gl: WebGLRenderingContext

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
    }

    load(shapes: Shape[], callback?: () => void) {
        let alreadyCreatedTextures: Map<string, WebGLTexture> = new Map()
        const textures = [...new Set(shapes.map(shape => shape.importedTexture))]
        this.loadHtmlImages(textures, textureToHtmlImageMap => {
            for (let shape of shapes) {
                let webglTexture
                if (!alreadyCreatedTextures.has(shape.importedTexture)) {
                    webglTexture = this.gl.createTexture()
                    this.gl.bindTexture(this.gl.TEXTURE_2D, webglTexture)
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_LINEAR)
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureToHtmlImageMap.get(shape.importedTexture))
                    this.gl.generateMipmap(this.gl.TEXTURE_2D)

                } else {
                    webglTexture = alreadyCreatedTextures.get(shape.importedTexture)
                }
                shape.webglTexture = webglTexture
            }
            callback?.()
        })
    }

    private loadHtmlImages(importedTextures: string[], callback: (map: Map<string, HTMLImageElement>) => void) {
        let htmlImages: HTMLImageElement[] = []
        let imagesToLoad = importedTextures.length

        const onImageLoad = () => {
            if (--imagesToLoad == 0) {
                const map = new Map();
                for (let i = 0; i < importedTextures.length; i++) {
                    map.set(importedTextures[i], htmlImages[i]);
                };
                callback(map)
            }
        }

        for (let i = 0; i < imagesToLoad; i++) {
            const image = new Image()
            image.src = importedTextures[i]
            htmlImages.push(image)
            image.onload = onImageLoad
        }
    }
}