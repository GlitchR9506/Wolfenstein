import { Vec3 } from './Vec3'
export { Vec3 }

export function radToDeg(r: number) {
    return r * 180 / Math.PI;
}

export function degToRad(d: number) {
    return d * Math.PI / 180;
}

export class Transform {
    position = Vec3.zero
    rotation = Vec3.zero
    scale = Vec3.identity
}

