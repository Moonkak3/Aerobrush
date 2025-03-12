import { dist2D, dist3D, avgPoint, checkInside } from "./vectorUtils.js";

// lm: handLandMarks
function getGesture(lm, type = "pinch") {
    const threshold = Math.max(
        dist2D(lm[5], lm[17]),
        dist2D(lm[17], lm[0]),
        dist2D(lm[0], lm[1]),
        dist2D(lm[1], lm[5])
    );

    let gesture = {
        mouseDown: false,
        close: false,
    };
    switch (type) {
        case "pinch": {
            // check if index and thumb are closed
            let distTip = dist3D(lm[4], lm[8]);
            let distJoint = dist3D(lm[3], lm[7]);
            gesture.mouseDown = distTip < distJoint && distTip < threshold / 5;

            // check if middle, ring and pinky are clenched
            gesture.close =
                checkInside(lm[0], lm[12], lm[10]) &&
                checkInside(lm[0], lm[16], lm[14]) &&
                checkInside(lm[0], lm[20], lm[18]);

            break;
        }
        case "point": {
            // check if thumb is closed (tip is between joint and pinky)
            gesture.mouseDown =
                checkInside(lm[3], lm[4], lm[5]) &&
                dist3D(lm[4], lm[10]) < threshold;

            // check if middle, ring and pinky are clenched
            gesture.close =
                checkInside(lm[0], lm[12], lm[10]) &&
                checkInside(lm[0], lm[16], lm[14]) &&
                checkInside(lm[0], lm[20], lm[18]);

            break;
        }
    }

    return gesture;
}

function getCursor(lm, type = "pinch") {
    let cursor = null;
    switch (type) {
        case "pinch": {
            const tips = avgPoint(lm[4], lm[8], 0.8);
            const joints = avgPoint(lm[3], lm[7], 0.5);
            cursor = avgPoint(tips, joints, 0.5);
            break;
        }
        case "point": {
            cursor = avgPoint(lm[7], lm[8]);
            break;
        }
    }
    return [cursor.x, cursor.y];
}

export { getGesture, getCursor };
