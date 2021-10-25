import Field from './Field'

export default class LevelField extends Field {
    readonly x: number
    readonly y: number
    constructor(x: number, y: number, colors: Map<string, string>) {
        super(colors)
        this.x = x
        this.y = y
    }

    get data() {
        return {
            x: this.x,
            y: this.y,
            value: this.value
        }
    }
}

customElements.define("level-field", LevelField)