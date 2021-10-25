import Level from "./Level";
import LevelField from "./LevelField";
import FieldData from "./FieldData";
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
        this.addLevelCreationListener()
        this.addSelectingListener()
        this.addSaveListener()
        this.addUploadListener()
        document.getElementById('gamerReturn')
        window.onbeforeunload = () => {
            if (this.editedLevel.hasChanges) {
                return "You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?";
            }
        }
    }

    private addLevelCreationListener() {
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

    private addSaveListener() {
        document.getElementById('save').onclick = () => {
            const a = document.createElement("a");
            const file = new Blob([JSON.stringify(this.editedLevel.data) as BlobPart], { type: 'text/plain' });
            a.href = URL.createObjectURL(file);
            a.download = 'level.json';
            a.click();
        }
    }

    private stopEditingLevel() {
        this.editedLevel.clearHtml()
        this.editedLevel = null
    }

    private addUploadListener() {
        document.getElementById('upload').onclick = () => {
            const input = document.createElement("input");
            input.type = 'file'
            input.click();
            input.onchange = e => {
                const file = (e.target as HTMLInputElement).files[0]
                const reader = new FileReader()
                reader.readAsText(file, "UTF-8");
                reader.onload = evt => {
                    const content = evt.target.result as string
                    const level = JSON.parse(content)
                    const fieldsData = level.fields as FieldData[]
                    this.stopEditingLevel()
                    this.editedLevel = new Level(level.width, level.height, this.colors, fieldsData)
                }
            }
        }
    }

    private addSelectingListener() {
        const getField = (e: MouseEvent) => {
            const hoveredField = e.target as LevelField
            return hoveredField.tagName == 'LEVEL-FIELD' ? hoveredField : null
        }

        const updateDisabled = (isLevelValid: boolean) => {
            if (isLevelValid) {
                document.getElementById('save').removeAttribute('disabled')
            } else {
                document.getElementById('save').setAttribute('disabled', 'disabled')
            }
        }

        document.getElementById('grid').onmousedown = e => {
            const lmbPressed = e.button == 0
            const rmbPressed = e.button == 2
            if (lmbPressed) {
                updateDisabled(this.editedLevel.isValid)
                this.editedLevel.setValue(getField(e), this.select.selectedValue)
            }
            if (rmbPressed) {
                updateDisabled(this.editedLevel.isValid)
                this.editedLevel.clearValue(getField(e))
            }
        }

        document.getElementById('grid').onmouseover = e => {
            const lmbPressed = e.buttons == 1
            const rmbPressed = e.buttons == 2
            if (lmbPressed) {
                updateDisabled(this.editedLevel.isValid)
                this.editedLevel.setValue(getField(e), this.select.selectedValue)
            }
            if (rmbPressed) {
                updateDisabled(this.editedLevel.isValid)
                this.editedLevel.clearValue(getField(e))
            }
        }
    }
}