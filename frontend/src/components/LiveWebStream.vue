<template>
    <div
        class="card"
        :style="{ top: divTop + 'px', left: divLeft + 'px' }"
        @mousedown="startDragging"
        @mousemove="dragging"
        @mouseup="stopDragging"
    >
        <div class="container">
            <div class="live-stream-container">
                <video ref="videoElement" autoplay></video>
                <canvas ref="canvasElement"></canvas>
            </div>
        </div>

        <div class="text-container">
            <h1 v-for="(value, key) in gesture" :key="key">
                {{ key }}: {{ value }}
            </h1>
        </div>
    </div>
</template>

<script>
// Import the necessary modules from the installed package
// Important for tasks-vision to be installed as @0.10.0
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { getCursor, getGesture } from "@/assets/scripts/gestureUtils.js"; // Update the path
import { handCursorStore } from "@/stores/handCursor";
// import { create } from "core-js/core/object";

export default {
    data() {
        return {
            // handCursor: handCursorStore(),
            handLandmarker: undefined,
            webcamRunning: true,
            lastVideoTime: -1,
            results: undefined,
            gesture: undefined,
            history: [],

            isDown: false,
            isDragging: false,
            lastX: 0,
            lastY: 0,
            startX: 0,
            startY: 0,
            handCursor: handCursorStore(),

            divTop: 20, // Initial top position
            divLeft: 20, // Initial left position
        };
    },
    mounted() {
        this.enableWebcam();
        this.createHandLandmarker();
    },
    methods: {
        async createHandLandmarker() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                this.handLandmarker = await HandLandmarker.createFromOptions(
                    vision,
                    {
                        baseOptions: {
                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                            delegate: "GPU",
                        },
                        runningMode: "VIDEO",
                        numHands: 2,
                    }
                );

                // HandLandmarker is now initialized and ready to use
                console.log("HandLandmarker initialized.");
            } catch (error) {
                console.error("Error initializing HandLandmarker:", error);
            }
        },
        async enableWebcam() {
            const videoElement = this.$refs.videoElement;
            const constraints = {
                video: {
                    aspectRatio: 16 / 9,
                },
            };

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                console.error(
                    "getUserMedia() is not supported by your browser"
                );
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia(
                    constraints
                );
                videoElement.srcObject = stream;
                videoElement.addEventListener("loadeddata", this.predictWebcam);
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        },
        async predictWebcam() {
            if (!this.handLandmarker) {
                console.log("HandLandmarker is not initialized yet.");
                return;
            }

            const videoElement = this.$refs.videoElement;
            const canvasElement = this.$refs.canvasElement;
            const canvasCtx = canvasElement.getContext("2d");

            canvasElement.width = videoElement.clientWidth;
            canvasElement.height = videoElement.clientHeight;

            // if (this.runningMode === "IMAGE") {
            //     this.runningMode = "VIDEO";
            //     await this.handLandmarker.setOptions({ runningMode: "VIDEO" });
            // }

            if (this.lastVideoTime !== videoElement.currentTime) {
                this.lastVideoTime = videoElement.currentTime;
                this.results = await this.handLandmarker.detectForVideo(
                    videoElement,
                    performance.now()
                );
            }

            canvasCtx.clearRect(
                0,
                0,
                canvasElement.width,
                canvasElement.height
            );
            if (this.results && this.results.landmarks) {
                this.interpretLandMarks(this.results.landmarks, canvasCtx);
            }

            if (this.webcamRunning) {
                window.requestAnimationFrame(this.predictWebcam);
            }
        },
        interpretLandMarks(resultsLandmarks, canvasCtx) {
            for (const landmarks of resultsLandmarks) {
                const modifiedLandmarks = landmarks.map((point) => {
                    return { ...point, x: 1 - point.x };
                });

                drawConnectors(canvasCtx, modifiedLandmarks, HAND_CONNECTIONS, {
                    color: "#00FF00",
                    lineWidth: 2,
                });
                drawLandmarks(canvasCtx, modifiedLandmarks, {
                    color: "#FF0000",
                    lineWidth: 0.5,
                });

                this.gesture = getGesture(modifiedLandmarks);

                this.history.unshift(this.gesture);
                while (this.history.length > 10) {
                    this.history.pop();
                }

                // this.gesture = (get the mode)
                let [x, y] = getCursor(modifiedLandmarks);
                this.updateHandCursor(x, y);
            }
        },
        updateHandCursor(x, y) {
            let eventType = null;

            // Perform actions based on the gesture
            if (this.gesture.close) {
                this.handCursor.mode = "draw";
            } else {
                this.handCursor.mode = "erase";
            }
            if (this.gesture.pinch) {
                eventType = "mousedown";
            } else {
                eventType = "mouseup";
            }
            x *= window.innerWidth;
            y *= window.innerHeight;

            // calculating bx, by
            // (brushX and brushY, which accounts for a lazy radius)
            const dx = x - this.lastX;
            const dy = y - this.lastY;
            const dist = (dx ** 2 + dy ** 2) ** 0.5;

            console.log(dist);
            if (dist <= this.handCursor.lazyRadius) return;

            const proportion = (dist - this.handCursor.lazyRadius) / dist;
            this.handCursor.x = this.lastX + dx * proportion;
            this.handCursor.y = this.lastY + dy * proportion;
            this.lastX = this.handCursor.x;
            this.lastY = this.handCursor.y;

            let target = document.elementFromPoint(x, y) ?? document.body;
            let eventOptions = {
                bubbles: true, // Whether the event bubbles up through the DOM or not
                cancelable: true, // Whether the event is cancelable
                // Additional properties depending on the type of MouseEvent
                clientX: this.handCursor.x, // X coordinate of the mouse pointer in client coordinates
                clientY: this.handCursor.y, // Y coordinate of the mouse pointer in client coordinates
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
        startDragging() {
            this.isDragging = true;
            this.startX = this.handCursor.x - this.divLeft;
            this.startY = this.handCursor.y - this.divTop;
            document.body.addEventListener("mousemove", this.dragging);
            document.body.addEventListener("mouseup", this.stopDragging);
        },
        dragging() {
            // console.log(event);
            if (this.isDragging) {
                this.divLeft = this.handCursor.x - this.startX;
                this.divTop = this.handCursor.y - this.startY;
            }
        },
        stopDragging() {
            // cons+ole.log(event);
            this.isDragging = false;
            document.body.removeEventListener("mousemove", this.dragging);
            document.body.removeEventListener("mouseup", this.stopDragging);
        },
    },
};
</script>
<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.text-container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: left;
}
.live-stream-container {
    display: block;
    position: relative;
}

.live-stream-container video {
    pointer-events: none;
    transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg);
    display: block;
    aspect-ratio: 16/9;
    height: 240px;
    position: relative;
    border-radius: 1rem;
    filter: grayscale(100%);
    z-index: 1; /* Video is behind the canvas */
}

.live-stream-container canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2; /* Canvas is on top of the video */
}

button {
    margin: 2rem;
}

.card {
    position: fixed;
    cursor: grab;
    z-index: 1;
}

h1 {
    margin: 0rem;
    text-align: left;
}
</style>
