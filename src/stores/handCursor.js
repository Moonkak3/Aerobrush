import { defineStore } from "pinia";
import { getCursor, getGesture } from "@/assets/scripts/gestureUtils.js"; // Update the path
import { handleCursor } from "@/assets/scripts/mouseUtils.js";

export const handCursorStore = defineStore("handCursor", {
    state: () => {
        return {
            x: 0,
            y: 0,
            mode: "draw",
            lazyRadius: 3,

            history: [],
            history_len: 2,
            isDown: false,
            isDragging: false,
            lastX: 0,
            lastY: 0,
        };
    },
    actions: {
        updateHandCursor(handedness, landmarks) {
            // Multiplier for border of the hand detection
            const borderMultiplier = 1;

            // handle position
            let [rawX, rawY] = getCursor(landmarks, "pinch");

            rawX = (rawX - 0.5) * borderMultiplier + 0.5;
            rawY = (rawY - 0.5) * borderMultiplier + 0.5;

            rawX *= window.innerWidth;
            rawY *= window.innerHeight;

            // calculating bx, by
            // (brushX and brushY, which accounts for a lazy radius)
            const dx = rawX - this.lastX;
            const dy = rawY - this.lastY;
            const dist = (dx ** 2 + dy ** 2) ** 0.5;

            if (dist <= this.lazyRadius) return;

            const proportion = (dist - this.lazyRadius) / dist;
            this.x = this.lastX + dx * proportion;
            this.y = this.lastY + dy * proportion;
            this.lastX = this.x;
            this.lastY = this.y;

            // handle gestures

            this.history.unshift(getGesture(landmarks, "pinch"));
            while (this.history.length > this.history_len) {
                this.history.pop();
            }

            if (
                this.history.every(
                    (gesture) =>
                        gesture.mouseDown === this.history[0].mouseDown &&
                        gesture.close === this.history[0].close
                )
            ) {
                this.gesture = this.history[0];
            }

            // Perform actions based on the gesture
            if (handedness === "Right") {
                if (this.gesture.close) {
                    this.mode = "draw";
                } else {
                    this.mode = "erase";
                }
            } else {
                if (this.gesture.close) {
                    this.mode = "pan";
                }
            }
            handleCursor(this.x, this.y, this.gesture.mouseDown);
        },
    },
});
