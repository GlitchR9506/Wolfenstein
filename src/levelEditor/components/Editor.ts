import Level from "./Level";
import LevelField from "./LevelField";
import Select from "./Select";

export default class Editor {
    private editedLevel: Level | null = null
    private select: Select
    private readonly colors = new Map([
        ['door', 'chocolate'],
        ['wall', 'lightslategray'],
        ['player', 'forestgreen'],
        ['enemy', 'crimson'],
    ])


    constructor() {
        this.select = new Select(this.colors)
        this.listenForLevelCreation()
        this.addEditingListener()
        document.getElementById('gamerReturn')
        window.onbeforeunload = () => {
            if (this.editedLevel.hasChanges) {
                return "You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?";
            }
        }
    }

    private listenForLevelCreation() {
        const formElement = document.getElementById('createLevelForm') as HTMLFormElement
        // formElement.onsubmit = e => {
        //     e.preventDefault()
        const widthElement = document.getElementById('width') as HTMLInputElement
        const heightElement = document.getElementById('height') as HTMLInputElement
        const width = parseInt(widthElement.value)
        const height = parseInt(heightElement.value)
        formElement.remove()
        // this.editedLevel = new Level(width, height)
        // this.editedLevel = new Level(40, 50)
        this.editedLevel = new Level(70, 50, this.colors)
        // this.editedLevel = new Level(50, 70)
        // }
    }

    private addEditingListener() {
        const getField = (e: MouseEvent) => {
            const hoveredField = e.target as LevelField
            if (hoveredField.tagName != 'LEVEL-FIELD') {
                return null
            } else {
                return hoveredField
            }
        }

        const place = (e: MouseEvent) => {
            if (this.select.selectedValue == 'player') {
                this.editedLevel.fields.find(f => f.value == 'player')?.setValue(null)
            }
            getField(e).setValue(this.select.selectedValue)
        }

        const clear = (e: MouseEvent) => {
            getField(e).setValue(null)
        }

        document.getElementById('grid').onmousedown = e => {
            const lmbPressed = e.button == 0
            const rmbPressed = e.button == 2
            if (lmbPressed) {
                place(e)
            }
            if (rmbPressed) {
                clear(e)
            }
            if (lmbPressed || rmbPressed) {
                if (this.editedLevel.isValid) {
                    document.getElementById('save').removeAttribute('disabled')
                } else {
                    document.getElementById('save').setAttribute('disabled', 'disabled')
                }
            }
        }

        document.getElementById('grid').onmouseover = e => {
            const lmbPressed = e.buttons == 1
            const rmbPressed = e.buttons == 2
            if (lmbPressed) {
                place(e)
            }
            if (rmbPressed) {
                clear(e)
            }
            if (lmbPressed || rmbPressed) {
                if (this.editedLevel.isValid) {
                    document.getElementById('save').removeAttribute('disabled')
                } else {
                    document.getElementById('save').setAttribute('disabled', 'disabled')
                }
            }
        }
    }
}