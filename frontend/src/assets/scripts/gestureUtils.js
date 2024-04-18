import { dist2D, dist3D, avgPoint, checkInside } from "./vectorUtils.js";

// lm: handLandMarks
function getGesture(lm) {
    const threshold = Math.max(
        dist2D(lm[5], lm[17]),
        dist2D(lm[17], lm[0]),
        dist2D(lm[0], lm[1]),
        dist2D(lm[1], lm[5])
    );

    // check if middle, ring and pinky are clenched
    if (
        checkInside(lm[0], lm[12], lm[10]) &&
        checkInside(lm[0], lm[16], lm[14]) &&
        checkInside(lm[0], lm[20], lm[18])
    ) {
        // check if index and thumb are closed
        let distTip = dist3D(lm[4], lm[8]);
        let distJoint = dist3D(lm[3], lm[7]);
        if (distTip < distJoint && distTip < threshold / 4) {
            return "click";
        } else {
            return "unclick";
        }
    }
    return "open";
}

function getCursor(lm) {
    const tips = avgPoint(lm[4], lm[8], 0.75);
    const joints = avgPoint(lm[3], lm[6], 0.5);
    const cursor = avgPoint(tips, joints, 0.25)
    return [cursor.x, cursor.y];
}

export { getGesture, getCursor };
