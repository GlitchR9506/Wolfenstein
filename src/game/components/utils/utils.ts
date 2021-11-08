import { Vec3 } from ".";

export function radToDeg(r: number) {
    return r * 180 / Math.PI;
}

export function degToRad(d: number) {
    return d * Math.PI / 180;
}

export function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new Vec3(
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ) : null;
}