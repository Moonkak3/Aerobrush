import { defineStore } from "pinia";
import { getCursor, getGesture } from "@/assets/scripts/gestureUtils.js"; // Update the path

export const handCursorStore = defineStore("handCursor", {
    state: () => {
        return {
            x: 0,
            y: 0,
            mode: "draw",
            lazyRadius: 5,

            history: [],
            history_len: 2,
            isDown: false,
            isDragging: false,
            lastX: 0,
            lastY: 0,
        };
    },
    actions: {
        updateHandCursor(landmarks) {
            // handle position
            let [rawX, rawY] = getCursor(landmarks);

            rawX = rawX * 1.2 - 0.1;
            rawY = rawY * 1.2 - 0.1;

            rawX *= window.innerWidth;
            rawY *= window.innerHeight;

            // calculating bx, by
            // (brushX and brushY, which accounts for a lazy radius)
            const dx = rawX - this.lastX;
            const dy = rawY - this.lastY;
            const dist = (dx ** 2 + dy ** 2) ** 0.5;

            console.log(dist);
            if (dist <= this.lazyRadius) return;

            const proportion = (dist - this.lazyRadius) / dist;
            this.x = this.lastX + dx * proportion;
            this.y = this.lastY + dy * proportion;
            this.lastX = this.x;
            this.lastY = this.y;

            // handle gestures

            this.history.unshift(getGesture(landmarks));
            while (this.history.length > this.history_len) {
                this.history.pop();
            }

            if (
                this.history.every(
                    (gesture) =>
                        gesture.pinch === this.history[0].pinch &&
                        gesture.close === this.history[0].close
                )
            ) {
                this.gesture = this.history[0];
            }

            let eventType = null;

            // Perform actions based on the gesture
            if (this.gesture.close) {
                this.mode = "draw";
            } else {
                this.mode = "erase";
            }
            if (this.gesture.pinch) {
                eventType = "mousedown";
            } else {
                eventType = "mouseup";
            }

            let target =
                document.elementFromPoint(this.x, this.y) ?? document.body;
            let eventOptions = {
                bubbles: true, // Whether the event bubbles up through the DOM or not
                cancelable: true, // Whether the event is cancelable
                // Additional properties depending on the type of MouseEvent
                clientX: this.x, // X coordinate of the mouse pointer in client coordinates
                clientY: this.y, // Y coordinate of the mouse pointer in client coordinates
            };

            const moveEvent = new MouseEvent("mousemove", eventOptions);
            target.dispatchEvent(moveEvent);

            if (
                (this.isDown && eventType === "mouseup") ||
                (!this.isDown && eventType === "mousedown")
            ) {
                this.isDown = !this.isDown;
                const mouseEvent = new MouseEvent(eventType, eventOptions);
                target.dispatchEvent(mouseEvent);
                if (eventType === "mouseup") {
                    const clickEvent = new MouseEvent("click", eventOptions);
                    target.dispatchEvent(clickEvent);
                }
            }
        },
    },
});
