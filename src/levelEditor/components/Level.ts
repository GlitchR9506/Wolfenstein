import LevelField from "./LevelField"

export default class Level {
    readonly width: number
    readonly height: number
    readonly colors: Map<string, string>
    readonly orientation: string
    readonly gridElement = document.getElementById('grid')
    readonly gridContainerElement = document.getElementById('gridContainer')
    hasChanges = false
    fields: LevelField[] = []

    constructor(width: number, height: number, colors: Map<string, string>) {
        this.width = width
        this.height = height
        this.colors = colors

        if (this.width > this.height) {
            this.orientation = 'landscape'
        } else if (this.width == this.height) {
            this.orientation = 'square'
        } else if (this.width < this.height) {
            this.orientation = 'horizontal'
        }

        this.gridElement.oncontextmenu = e => e.preventDefault()

        this.createGrid()
    }

    get isValid() {
        return this.fields.some(f => f.value == 'player')
    }

    setValue(field: LevelField, value: string) {
        if (value == 'player') {
            this.fields.find(f => f.value == 'player')?.setValue(null)
        }
        field.setValue(value)
        this.hasChangesUpdate()
    }

    clearValue(field: LevelField) {
        field.setValue(null)
        this.hasChangesUpdate()
    }

    get data() {
        return {
            width: this.width,
            height: this.height,
            fields: this.fields.filter(f => f.value).map(f => f.data),
        }
    }

    private hasChangesUpdate() {
        if (this.fields.some(f => f.value)) {
            this.hasChanges = true
        } else {
            this.hasChanges = false
        }
    }

    private createGrid() {
        this.gridElement.style.setProperty('--grid-rows', this.height.toString());
        this.gridElement.style.setProperty('--grid-cols', this.width.toString());

        this.addResizeListener()

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const field = new LevelField(col, row, this.colors)
                this.gridElement.appendChild(field)
                this.fields.push(field)
            }
        }
    }

    private addResizeListener() {
        this.gridElement.style.minWidth = this.widthToSet + 'px'
        window.onresize = e => {
            this.gridElement.style.minWidth = this.widthToSet + 'px'
        }
    }

    private get widthToSet() {
        const computedStyle = getComputedStyle(this.gridContainerElement);
        const verticalPadding = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom) + 1;
        const horizontalPadding = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight) + 1;
        const containerHeight = this.gridContainerElement.clientHeight - verticalPadding;
        const containerWidth = this.gridContainerElement.clientWidth - horizontalPadding;

        let widthToSet = containerWidth
        const resultingHeight = widthToSet * this.height / this.width

        if (resultingHeight > containerHeight) {
            widthToSet = containerHeight * this.width / this.height
        }

        return widthToSet
    }
}