export default abstract class Field extends HTMLElement {
    readonly colors: Map<string, string>
    value: string

    constructor(colors: Map<string, string>) {
        super()
        this.colors = colors
    }

    setValue(value: string | null) {
        this.value = value
        this.style.backgroundColor = value ? this.colors.get(value) : ''
    }
}