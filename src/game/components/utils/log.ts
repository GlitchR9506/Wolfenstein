import { Vec3 } from './Vec3'

export function log(name: string, value: Vec3 | string | number | boolean) {
    if (typeof value === 'undefined') return
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

    if (typeof value == 'boolean') {
        value = value ? 'true' : 'false'
    } else {
        if (value instanceof Vec3) {
            value = `x: ${value.x.toFixed(2)} y: ${value.y.toFixed(2)} z: ${value.z.toFixed(2)}`
            element.parentElement.style.minWidth = '200px'
        } else {
            if (typeof value != 'string') {
                value = String(value.toFixed(2))
            }
        }
    }
    if (element.innerText != value) {
        element.innerText = value
    }
}