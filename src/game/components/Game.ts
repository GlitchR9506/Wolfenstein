import { ColorProgram, ColorProgramInfo } from './programs/ColorProgram'
import Camera from './Camera'
import Input from './Input'
import Level from './Level'
import Crosshair from './shapes/Crosshair'
import { log } from './utils'
import Interactable from './shapes/Interactable'
import { TextureProgram, TextureProgramInfo } from './programs/TextureProgram'
import { ProgramInfo } from './programs/Program'
import Wall from './shapes/Wall'
import Door from './shapes/Door'
import Enemy from './shapes/Enemy'


export default class Game {
    private readonly colorProgram: ColorProgram
    private readonly textureProgram: TextureProgram
    private readonly camera: Camera
    private readonly input: Input
    private readonly level: Level
    private readonly crosshair: Crosshair
    private readonly gl: WebGLRenderingContext
    private map: Map<string, HTMLImageElement> = new Map()
    textures: Map<string, WebGLTexture> = new Map()

    constructor() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.gl = canvas.getContext("webgl");
        if (!this.gl) { /*no webgl for you!*/ }
        this.gl.clearColor(0, 0, 0, 0);

        this.colorProgram = new ColorProgram(this.gl)
        this.textureProgram = new TextureProgram(this.gl)
        this.camera = new Camera(this.gl)
        this.input = new Input()

        this.crosshair = new Crosshair(this.gl)

        const textures = [Wall.texture, Enemy.texture, Door.texture]
        this.loadImages(textures, images => {
            textures.forEach((t, i) => {
                this.map.set(t, images[i])
                const texture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                // this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.map.get(Wall.texture));
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                // this.gl.generateMipmap(this.gl.TEXTURE_2D);
                this.textures.set(t, texture)
            })
        })



        this.level = new Level(this.gl, () => {
            this.camera.transform.position = this.level.playerPosition

            // {
            //     this.texture1 = this.gl.createTexture();
            //     this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture1);
            //     this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.map.get(Wall.texture));
            //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            //     this.gl.generateMipmap(this.gl.TEXTURE_2D);


            //     this.texture2 = this.gl.createTexture();
            //     this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture2);
            //     this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.map.get(Door.texture));
            //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            //     this.gl.generateMipmap(this.gl.TEXTURE_2D);

            // }



            this.startGameLoop()
            // this.level.doors[0].transform.rotation.y = Math.PI
        })

        // this.startGameLoop()
    }

    loadImages(urls: string[], callback: (images: HTMLImageElement[]) => void) {
        var images: HTMLImageElement[] = [];
        var imagesToLoad = urls.length;

        // Called each time an image finished loading.
        var onImageLoad = function () {
            --imagesToLoad;
            // If all the images are loaded call the callback.
            if (imagesToLoad == 0) {
                callback(images);
            }
        };

        for (var ii = 0; ii < imagesToLoad; ++ii) {
            var image = new Image();
            image.src = urls[ii];
            images.push(image);
            image.onload = onImageLoad
        }
    }

    private startGameLoop() {
        let then = 0
        requestAnimationFrame(now => render(now));
        const render = (now: number) => {
            now *= 0.001;  // convert to seconds
            const deltaTime = now - then;
            then = now;

            this.draw(deltaTime)

            requestAnimationFrame(now => render(now));
        }
    }

    private draw(deltaTime: number) {
        this.setDrawSettings()

        this.colorProgram.use()
        this.crosshair.draw(this.colorProgram.info, this.camera.projectionMatrix)


        this.textureProgram.use()

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.get(Wall.texture));
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.map.get(Wall.texture));
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        for (let wall of this.level.walls) {
            // wall.draw(this.colorProgram.info, this.camera.viewProjectionMatrix)
            wall.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.get(Enemy.texture));
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.map.get(Enemy.texture));
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        for (let enemy of this.level.enemies) {
            let lookingAtEnemy = this.camera.isLookingAt(enemy)
            if (lookingAtEnemy) {
                if (this.input.shooting) {
                    enemy.setColor(0, [255, 0, 0])
                    enemy.updateBuffers()
                }
            } else {
                enemy.resetColor()
                enemy.updateBuffers()
            }
            enemy.lookAtCamera(this.camera.transform.rotation.y)
            enemy.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)
        }



        if (this.input.interacting) {
            const nearest = this.camera.nearest(this.level.interactables) as Interactable
            if (this.camera.inInteractionDistance(nearest)) {
                nearest.interact()
            }
        }





        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.get(Door.texture));
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.map.get(Door.texture));
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        for (let door of this.level.doors) {
            door.update(deltaTime)
            door.draw(this.textureProgram.info, this.camera.viewProjectionMatrix)
        }

        this.camera.checkCollisions(this.level.collidingCuboids)
        this.camera.rotate(this.input.rotation * deltaTime)
        this.camera.move(this.input.direction.multiply(deltaTime))
    }


    private setDrawSettings() {
        this.resizeCanvasToDisplaySize(this.gl.canvas)

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.input.update()
    }

    private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

        if (needResize) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            this.camera.updateProjectionMatrix()
        }

        return needResize;
    }
}