import SelectField from "./SelectField"

export default class UI {
    readonly colors: Map<string, string>
    readonly objectsElement = document.getElementById('objects')
    readonly objects: string[]
    readonly fields: SelectField[] = []
    selectedField: SelectField | null = null

    constructor(colors: Map<string, string>) {
        this.colors = colors
        this.objects = [...this.colors.keys()]
        for (let object of this.objects) {
            const field = new SelectField(object, this.colors)

            field.onclick = () => {
                this.selectedField = field
                this.fields.forEach(f => f.deselect())
                field.select()
            }

            this.objectsElement.appendChild(field)

            this.fields.push(field)
        }
    }

    get selectedValue() {
        if (this.selectedField) {
            return this.selectedField.value
        } else {
            return null
        }
    }
}