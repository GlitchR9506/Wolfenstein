import { Vec3 } from './Vec3'

const m4 = {
    translation: (v: Vec3) => {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            v.x, v.y, v.z, 1,
        ]
    },

    get identity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    },

    rotate: (mTarget: number[], v: Vec3) => {
        let m = m4.multiply(mTarget, m4.xRotation(v.x))
        m = m4.multiply(m, m4.yRotation(v.y))
        m = m4.multiply(m, m4.zRotation(v.z))
        return m
    },

    xRotation: (angleInRadians: number) => {
        const c = Math.cos(angleInRadians)
        const s = Math.sin(angleInRadians)

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ]
    },

    yRotation: (angleInRadians: number) => {
        const c = Math.cos(angleInRadians)
        const s = Math.sin(angleInRadians)

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ]
    },

    zRotation: (angleInRadians: number) => {
        const c = Math.cos(angleInRadians)
        const s = Math.sin(angleInRadians)

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    },

    scaling: (v: Vec3) => {
        return [
            v.x, 0, 0, 0,
            0, v.y, 0, 0,
            0, 0, v.z, 0,
            0, 0, 0, 1,
        ]
    },

    translate: (m: number[], v: Vec3) => {
        return m4.multiply(m, m4.translation(v))
    },

    xRotate: (m: number[], angleInRadians: number) => {
        return m4.multiply(m, m4.xRotation(angleInRadians))
    },

    yRotate: (m: number[], angleInRadians: number) => {
        return m4.multiply(m, m4.yRotation(angleInRadians))
    },

    zRotate: (m: number[], angleInRadians: number) => {
        return m4.multiply(m, m4.zRotation(angleInRadians))
    },

    scale: (m: number[], v: Vec3) => {
        return m4.multiply(m, m4.scaling(v))
    },

    perspective: (fieldOfViewInRadians: number, aspect: number, near: number, far: number) => {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    makeZToWMatrix(fudgeFactor: number) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, fudgeFactor,
            0, 0, 0, 1,
        ];
    },

    multiply: (a: number[], b: number[]) => {
        const a11 = a[0 * 4 + 0]
        const a12 = a[0 * 4 + 1]
        const a13 = a[0 * 4 + 2]
        const a14 = a[0 * 4 + 3]
        const a21 = a[1 * 4 + 0]
        const a22 = a[1 * 4 + 1]
        const a23 = a[1 * 4 + 2]
        const a24 = a[1 * 4 + 3]
        const a31 = a[2 * 4 + 0]
        const a32 = a[2 * 4 + 1]
        const a33 = a[2 * 4 + 2]
        const a34 = a[2 * 4 + 3]
        const a41 = a[3 * 4 + 0]
        const a42 = a[3 * 4 + 1]
        const a43 = a[3 * 4 + 2]
        const a44 = a[3 * 4 + 3]
        const b11 = b[0 * 4 + 0]
        const b12 = b[0 * 4 + 1]
        const b13 = b[0 * 4 + 2]
        const b14 = b[0 * 4 + 3]
        const b21 = b[1 * 4 + 0]
        const b22 = b[1 * 4 + 1]
        const b23 = b[1 * 4 + 2]
        const b24 = b[1 * 4 + 3]
        const b31 = b[2 * 4 + 0]
        const b32 = b[2 * 4 + 1]
        const b33 = b[2 * 4 + 2]
        const b34 = b[2 * 4 + 3]
        const b41 = b[3 * 4 + 0]
        const b42 = b[3 * 4 + 1]
        const b43 = b[3 * 4 + 2]
        const b44 = b[3 * 4 + 3]

        return [
            a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41,
            a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42,
            a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43,
            a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44,
            a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41,
            a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42,
            a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43,
            a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44,
            a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41,
            a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42,
            a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43,
            a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44,
            a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41,
            a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42,
            a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43,
            a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44,
        ]
    },

    multiplyScalar(m: number[], scalar: number) {
        return m.map(el => el * scalar)
    },

    det: (m: number[]) => {
        const m11 = m[0 * 4 + 0]
        const m12 = m[0 * 4 + 1]
        const m13 = m[0 * 4 + 2]
        const m14 = m[0 * 4 + 3]
        const m21 = m[1 * 4 + 0]
        const m22 = m[1 * 4 + 1]
        const m23 = m[1 * 4 + 2]
        const m24 = m[1 * 4 + 3]
        const m31 = m[2 * 4 + 0]
        const m32 = m[2 * 4 + 1]
        const m33 = m[2 * 4 + 2]
        const m34 = m[2 * 4 + 3]
        const m41 = m[3 * 4 + 0]
        const m42 = m[3 * 4 + 1]
        const m43 = m[3 * 4 + 2]
        const m44 = m[3 * 4 + 3]

        return (
            m11 * m22 * m33 * m44 + m11 * m23 * m34 * m42 + m11 * m24 * m32 * m43 +
            +m12 * m21 * m34 * m43 + m12 * m23 * m31 * m44 + m12 * m24 * m33 * m41 +
            +m13 * m21 * m32 * m44 + m13 * m22 * m34 * m41 + m13 * m24 * m31 * m42 +
            +m14 * m21 * m33 * m42 + m14 * m22 * m31 * m43 + m14 * m23 * m32 * m41 +
            -m11 * m22 * m34 * m43 - m11 * m23 * m32 * m44 - m11 * m24 * m33 * m42 +
            -m12 * m21 * m33 * m44 - m12 * m23 * m34 * m41 - m12 * m24 * m31 * m43 +
            -m13 * m21 * m34 * m42 - m13 * m22 * m31 * m44 - m13 * m24 * m32 * m41 +
            -m14 * m21 * m32 * m43 - m14 * m22 * m33 * m41 - m14 * m23 * m31 * m42
        )
    },

    inverse(m: number[]) {
        let dst = new Array(16);
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];

        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        dst[0] = d * t0;
        dst[1] = d * t1;
        dst[2] = d * t2;
        dst[3] = d * t3;
        dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
        dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
        dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
        dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
        dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
        dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
        dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
        dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
        dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
        dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
        dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
        dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

        return dst;
    },

    lookAt: function (source: Vec3, target: Vec3) {
        var zAxis = source.substract(target).normalize;
        var xAxis = Vec3.up.cross(zAxis).normalize;
        var yAxis = zAxis.cross(xAxis).normalize;

        return [
            xAxis.x, xAxis.y, xAxis.z, 0,
            yAxis.x, yAxis.y, yAxis.z, 0,
            zAxis.x, zAxis.y, zAxis.z, 0,
            source.x, source.y, source.z, 1,
        ];
    },

    getPositionVector: function (m: number[]) {
        return new Vec3(m[12], m[13], m[14]).map(v => v < 0.0000001 ? 0 : v)
    },

    getScaleVector: function (m: number[]) {
        return new Vec3(
            new Vec3(m[0], m[4], m[8]).magnitude,
            new Vec3(m[1], m[5], m[9]).magnitude,
            new Vec3(m[2], m[6], m[10]).magnitude,
        )
    },

    getRotationMatrix: function (m: number[]) {
        const s = m4.getScaleVector(m)
        return [
            m[0] / s.x, m[1] / s.y, m[2] / s.z, 0,
            m[4] / s.x, m[5] / s.y, m[6] / s.z, 0,
            m[8] / s.x, m[9] / s.y, m[10] / s.z, 0,
            0, 0, 0, 1
        ]
    },

}

// export default m4
export { m4 }