import { Program, ProgramInfo } from "./Program";
import vertexShaderSource from '../../shaders/texture.vs';
import fragmentShaderSource from '../../shaders/texture.fs';

export interface TextureProgramInfo extends ProgramInfo {
    attributes: {
        position: number,
        texcoord: number,
    },
    uniforms: {
        matrix: WebGLUniformLocation
    },
}

export class TextureProgram extends Program {
    info: TextureProgramInfo = {
        attributes: {
            position: this.attribute("a_position"),
            texcoord: this.attribute("a_texcoord"),
        },
        uniforms: {
            matrix: this.uniform("u_matrix")
        },
    }

    constructor(gl: WebGLRenderingContext) {
        super(gl, vertexShaderSource, fragmentShaderSource,)
    }

    loadTexture(src: string, callback: () => void) {
        // Create a texture.
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Fill the texture with a 1x1 blue pixel.
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // Asynchronously load an image
        var image = new Image();
        image.src = src
        image.addEventListener('load', () => {
            // Now that the image has loaded make copy it to the texture.
            // this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            // this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            // this.gl.generateMipmap(this.gl.TEXTURE_2D);

            callback()
        });
    }
}