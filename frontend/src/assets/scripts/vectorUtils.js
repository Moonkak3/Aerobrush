class Vector {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

function dist2D(landmark1, landmark2, root = true) {
    let value =
        Math.pow(landmark1.x - landmark2.x, 2) +
        Math.pow(landmark1.y - landmark2.y, 2);
    if (root) {
        value = Math.sqrt(value);
    }
    return value;
}

function dist3D(landmark1, landmark2, root = true) {
    let value =
        Math.pow(landmark1.x - landmark2.x, 2) +
        Math.pow(landmark1.y - landmark2.y, 2) +
        Math.pow(landmark1.z - landmark2.z, 2);
    if (root) {
        value = Math.sqrt(value);
    }
    return value;
}

function dot3D(landmark1, landmark2) {
    return (
        landmark1.x * landmark2.x +
        landmark1.y * landmark2.y +
        landmark1.z * landmark2.z
    );
}

function dot2D(landmark1, landmark2) {
    return landmark1.x * landmark2.x + landmark1.y * landmark2.y;
}

function checkInside(A, B, C) {
    let AB = new Vector(B.x - A.x, B.y - A.y);
    let CB = new Vector(B.x - C.x, B.y - C.y);
    let AC = new Vector(C.x - A.x, C.y - A.y);
    let AC2 = dist2D(A, C, false);

    if (Math.abs(dot2D(AB, AC)) > AC2 || Math.abs(dot2D(CB, AC)) > AC2) {
        return false;
    } else {
        return true;
    }
}

export { Vector, dist2D, dist3D, dot3D, dot2D, checkInside };
