<template>
    <div>
        <video ref="videoElement" width="640" height="480" autoplay></video>
        <button @click="startStreaming" :disabled="streaming">
            Start Streaming
        </button>
        <button @click="stopStreaming" :disabled="!streaming">
            Stop Streaming
        </button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            videoElement: null,
            streaming: false,
            websocket: null,
        };
    },
    mounted() {
        this.videoElement = this.$refs.videoElement;
    },
    methods: {
        startStreaming() {
            this.streaming = true;

            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then((stream) => {
                    this.videoElement.srcObject = stream;

                    this.websocket = new WebSocket("ws://localhost:8765");
                    this.websocket.binaryType = "arraybuffer";

                    this.websocket.onopen = () => {
                        this.sendFrame();
                    };

                    this.websocket.onerror = (error) => {
                        console.error("WebSocket error:", error);
                    };
                })
                .catch((error) => {
                    console.error("Error accessing media devices:", error);
                });
        },
        stopStreaming() {
            this.streaming = false;
            if (
                this.websocket &&
                this.websocket.readyState === WebSocket.OPEN
            ) {
                this.websocket.close();
            }
        },
        sendFrame() {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const width = this.videoElement.width;
            const height = this.videoElement.height;

            canvas.width = width;
            canvas.height = height;

            const sendFrameLoop = () => {
                if (!this.streaming) {
                    return;
                }

                context.drawImage(this.videoElement, 0, 0, width, height);
                // canvas.toBlob((blob) => {
                //     this.websocket.send(blob);
                // }, "image/jpeg");

                // console.log(canvas.toDataURL());

                this.websocket.send(
                    canvas.toDataURL().split("data:image/png;base64,")[1]
                );

                requestAnimationFrame(sendFrameLoop);
            };

            sendFrameLoop();
        },
    },
};
</script>
