import Field from './Field'

export default class SelectField extends Field {
    readonly object: string
    constructor(object: string, colors: Map<string, string>) {
        super(colors)
        this.object = object
        this.setValue(object)
    }

    connectedCallback() {
        this.innerText = this.object
        this.style.backgroundColor = this.colors.get(this.value)
    }

    select() {
        this.classList.add('selected')
    }

    deselect() {
        this.classList.remove('selected')
    }
}

customElements.define("select-field", SelectField)