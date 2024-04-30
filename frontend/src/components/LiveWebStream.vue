<template>
    <div ref="card" >
        <Card style="display: inline-block" class="container">
            <template #header>
                <div class="live-stream-container">
                    <video ref="videoElement" autoplay></video>
                    <canvas ref="canvasElement"></canvas>
                </div>
            </template>
        </Card>
    </div>
</template>

<script>
// Import the necessary modules from the installed package
// Important for tasks-vision to be installed as @0.10.0
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { handCursorStore } from "@/stores/handCursor";
import Card from "primevue/card";

export default {
    components: {
        Card,
    },
    data() {
        return {
            // handCursor: handCursorStore(),
            handLandmarker: undefined,
            webcamRunning: true,
            lastVideoTime: -1,
            results: undefined,
            gesture: undefined,

            handCursor: handCursorStore(),
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
                    lineWidth: 1,
                });
                drawLandmarks(canvasCtx, modifiedLandmarks, {
                    color: "#FF0000",
                    radius: 1,
                });
                // this.gesture = (get the mode)
                this.handCursor.updateHandCursor(modifiedLandmarks);
            }
        },
    },
};
</script>
<style lang="scss" scoped>
@import "../assets/stylesheets/main.scss";
:deep(.p-card-body) {
    margin: 0;
    padding: 0;
}
.container {
    position: fixed;
    display: inline-block;
    pointer-events: none;
    top: 20px;
    left: 20px;
    z-index: 9;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
.text-container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: left;
}
.live-stream-container {
    display: inline-block;
}

.live-stream-container video {
    pointer-events: none;
    transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg);
    display: block;
    aspect-ratio: 16/9;
    object-fit: contain;
    max-width: 12vw;
    max-height: 12vh;
    width: 100%;
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

h1 {
    margin: 0rem;
    text-align: left;
}
</style>
