<template>
    <div>
        <div class="live-stream-container">
            <video ref="videoElement" autoplay></video>
            <canvas ref="canvasElement"></canvas>
        </div>
        <button @click="toggleWebcam">
            {{ webcamRunning ? "Disable Predictions" : "Enable Predictions" }}
        </button>
    </div>
</template>

<script>
// Import the necessary modules from the installed package
// Important for tasks-vision to be installed as @0.10.0
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
export default {
    data() {
        return {
            handLandmarker: undefined,
            webcamRunning: false,
            lastVideoTime: -1,
            results: undefined,
        };
    },
    mounted() {
        // this.enableWebcam();
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
            const constraints = { video: true };

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

            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;

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
                for (const landmarks of this.results.landmarks) {
                    // console.log(landmarks);
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                        color: "#00FF00",
                        lineWidth: 5,
                    });
                    drawLandmarks(canvasCtx, landmarks, {
                        color: "#FF0000",
                        lineWidth: 2,
                    });
                }
            }

            if (this.webcamRunning) {
                window.requestAnimationFrame(this.predictWebcam);
            }
        },
        toggleWebcam() {
            this.webcamRunning = !this.webcamRunning;
            if (this.webcamRunning) {
                this.enableWebcam();
            }
        },
    },
};
</script>
<style scoped>
.live-stream-container {
    position: relative;
}

.live-stream-container video {
    display: block;
    height: auto;
    position: absolute;
    z-index: 1; /* Video is behind the canvas */
}

.live-stream-container canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2; /* Canvas is on top of the video */
}
</style>
