export default class DeathScreen {
    canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private pixels: ImageData
    private frame = 0
    private started = false
    private reversed = false
    private interval: NodeJS.Timer

    constructor() {
        this.canvas = document.createElement('canvas')

        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false;

        this.canvas.width = 320
        this.canvas.height = 200

        this.pixels = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    }

    start() {
        if (!this.started) {
            this.started = true
            this.interval = setInterval(() => this.update(), 1);
        }
    }

    /* Write a pixel, just set alpha and RGB channels. */
    private setPixelRed(x: number, y: number) {
        var offset = x * 4 + y * 4 * this.canvas.width;
        this.pixels.data[offset + 3] = 255;
        this.pixels.data[offset + 0] = 255;
        this.pixels.data[offset + 1] = 0;
        this.pixels.data[offset + 2] = 0;
    }
    private setPixelTransparent(x: number, y: number) {
        var offset = x * 4 + y * 4 * this.canvas.width;
        this.pixels.data[offset + 3] = 0;
        this.pixels.data[offset + 0] = 0;
        this.pixels.data[offset + 1] = 0;
        this.pixels.data[offset + 2] = 0;
    }

    /* Transforms the 16 bit input into another seemingly psenduo random number
     * in the same range. Every input 16 bit input will generate a different
     * 16 bit output. This is called a Feistel network. */
    private feistelNet(input: number) {
        var l = input & 0xff;
        var r = input >> 8;
        for (var i = 0; i < 8; i++) {
            var nl = r;
            var F = (((r * 11) + (r >> 5) + 7 * 127) ^ r) & 0xff;
            r = l ^ F;
            l = nl;
        }
        return ((r << 8) | l) & 0xffff;
    }

    /* Called once every millisecond, sets 100 pixels. */
    private update() {
        /* Set 100 pixels per iteration otherwise it's too slow. */
        for (let j = 0; j < 200; j++) {
            if (this.frame == 65536) {
                setTimeout(() => {
                    this.reversed = true
                    setTimeout(() => {
                        this.frame = 0
                        this.started = false
                        this.reversed = false
                        clearInterval(this.interval)
                        this.interval = null
                    }, 10000)
                }, 2000)
            }
            var fn = this.feistelNet(this.frame);
            var x = fn % this.canvas.width;
            var y = Math.floor(fn / this.canvas.width);
            if (x < this.canvas.width && y < this.canvas.height) {
                if (this.reversed) {
                    this.setPixelTransparent(x, y);
                } else {
                    this.setPixelRed(x, y);
                }
            }
            this.frame++;
        }
        this.ctx.fillStyle = "green"
        this.ctx.fillRect(0, 0, 100, 100)
        this.ctx.putImageData(this.pixels, 0, 0);
    }

}