import { Vec3 } from './Vec3'

export function log(name: string, value: any) {
    let element = document.getElementById(name)
    if (!element) {
        const ui = document.getElementById('ui')

        const container = document.createElement('div')
        const label = document.createElement('div')
        label.innerText = name + ':'
        label.classList.add('label')
        const value = document.createElement('div')
        value.id = name
        value.classList.add('value')

        container.appendChild(label)
        container.appendChild(value)
        ui.appendChild(container)

        element = value
    }

    if (typeof value == 'undefined') {
        value = 'undefined'
    } else if (value instanceof Vec3) {
        value = `x: ${value.x.toFixed(2)} y: ${value.y.toFixed(2)} z: ${value.z.toFixed(2)}`
        element.parentElement.style.minWidth = '200px'
    } else if (typeof value == 'number') {
        value = value.toFixed(2).toString()
    } else if (typeof value != 'string') {
        value = JSON.stringify(value)
    }

    if (element.innerText != value) {
        element.innerText = value
    }
}