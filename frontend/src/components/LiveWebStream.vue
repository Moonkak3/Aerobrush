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

        <h1>
            {{ gesture }}
        </h1>
        <!-- <button @click="toggleWebcam">
            {{ webcamRunning ? "Disable Predictions" : "Enable Predictions" }}
        </button> -->
    </div>
</template>

<script>
// Import the necessary modules from the installed package
// Important for tasks-vision to be installed as @0.10.0
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { getCursor, getGesture } from "@/assets/scripts/gestureUtils.js"; // Update the path
// import { handCursorStore } from "@/stores/handCursor";

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
            startX: 0,
            startY: 0,
            divTop: 0, // Initial top position
            divLeft: 0, // Initial left position
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
                console.log(this.handLandmarker);
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

                // this.handCursor.click =
                //     this.gesture === "click" ? true : false;

                let eventType = null;

                // Perform actions based on the gesture
                switch (this.gesture) {
                    case "click":
                        eventType = "mousedown";
                        break;
                    case "unclick":
                        eventType = "mouseup";
                        break;
                    case "open":
                        eventType = "mouseup";
                        break;
                    default:
                        // Perform default action
                        break;
                }
                let [x, y] = getCursor(modifiedLandmarks)
                x *= window.innerWidth;
                y *= window.innerHeight;
                let target = document.elementFromPoint(x, y) ?? document.body;
                let eventOptions = {
                    bubbles: true, // Whether the event bubbles up through the DOM or not
                    cancelable: true, // Whether the event is cancelable
                    // Additional properties depending on the type of MouseEvent
                    clientX: x, // X coordinate of the mouse pointer in client coordinates
                    clientY: y, // Y coordinate of the mouse pointer in client coordinates
                };

                const event1 = new MouseEvent("mousemove", eventOptions);
                target.dispatchEvent(event1);

                if (
                    (this.isDown && eventType === "mouseup") ||
                    (!this.isDown && eventType === "mousedown")
                ) {
                    this.isDown = !this.isDown;
                    const event2 = new MouseEvent(eventType, eventOptions);
                    target.dispatchEvent(event2);
                    if (eventType === "mouseup") {
                        const event3 = new MouseEvent("click", eventOptions);
                        target.dispatchEvent(event3);
                    }
                }
            }
        },
        startDragging(event) {
            this.isDragging = true;
            this.startX = event.clientX - this.divLeft;
            this.startY = event.clientY - this.divTop;
            document.body.addEventListener("mousemove", this.dragging);
            document.body.addEventListener("mouseup", this.stopDragging);
        },
        dragging(event) {
            // console.log(event);
            if (this.isDragging) {
                this.divLeft = event.clientX - this.startX;
                this.divTop = event.clientY - this.startY;
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
    z-index: 1; /* Video is behind the canvas */
}

.live-stream-container canvas {
    /* transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg); */
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
    /* transition: 50ms; */
    z-index: 1;
}
</style>
