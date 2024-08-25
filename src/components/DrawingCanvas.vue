<template>
    <div class="container">
        <canvas
            id="canvas"
            ref="canvas"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @download-canvas="downloadCanvas"
        ></canvas>
        <canvas id="background" ref="background"></canvas>
    </div>
</template>

<script>
import paper from "paper";
import { handCursorStore } from "@/stores/handCursor";
import { brushStore } from "@/stores/brush";
import { eraserStore } from "@/stores/eraser";
import { eventBus } from "@/assets/scripts/eventBus";
export default {
    data() {
        return {
            isDrawing: false,
            receivedPaths: null,
            path: null,
            eraseLayer: null,
            lazyRadius: 10,
            handCursor: handCursorStore(),
            brush: brushStore(),
            eraser: eraserStore(),
        };
    },
    setup() {},
    mounted() {
        this.$refs.canvas.width = 1920;
        this.$refs.canvas.height = 1080;
        this.$refs.canvas.left = (window.innerWidth - 1920) / 2;
        this.$refs.canvas.top = (window.innerHeight - 1080) / 2;
        this.$refs.background.width = 1920;
        this.$refs.background.height = 1080;
        this.$refs.background.left = (window.innerWidth - 1920) / 2;
        this.$refs.background.top = (window.innerHeight - 1080) / 2;
        paper.setup(this.$refs.canvas);

        // Listen for the 'download' event on the event bus
        eventBus.on("download", this.downloadCanvas);

        this.receivedPaths = {};

        // Initialize WebSocket connection
        this.websocket = new WebSocket(`ws://${window.location.hostname}:8765`);

        this.websocket.onopen = () => {
            console.log("WebSocket connection opened at " + window.location.hostname);
        };

        this.websocket.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            this.handleReceivedData(receivedData);
        };

        this.websocket.onclose = () => {
            console.log("WebSocket connection closed");
        };
    },
    beforeUnmount() {
        paper.projects.forEach((project) => {
            project.remove();
        });
        if (this.websocket) {
            this.websocket.close();
        }
        // Remove the event listener on unmount
        eventBus.off("download", this.downloadCanvas);
    },
    methods: {
        startDrawing() {
            if (this.handCursor.mode === "draw") {
                this.path = new paper.Path({
                    strokeColor: this.brush.color,
                    strokeWidth: this.brush.size,
                    opacity: this.brush.opacity,
                    strokeCap: "round",
                    blendMode: "normal",
                });
            } else if (this.handCursor.mode === "erase") {
                this.path = new paper.Path({
                    strokeColor: this.eraser.color,
                    strokeWidth: this.eraser.size,
                    opacity: this.eraser.opacity,
                    strokeCap: "round",
                    blendMode: "destination-out",
                });
            }
            const pathData = {
                points: this.path.segments.map((segment) => ({
                    x: segment.point.x,
                    y: segment.point.y,
                })),
                strokeColor: this.brush.color,
                strokeWidth: this.path.strokeWidth,
                opacity: this.path.opacity,
                blendMode: this.path.blendMode,
            };
            if (
                this.websocket &&
                this.websocket.readyState === WebSocket.OPEN
            ) {
                this.websocket.send(
                    JSON.stringify({ action: "startDrawing", path: pathData })
                );
            }
            this.isDrawing = true;
            paper.view.draw();
        },
        draw(event) {
            if (!this.isDrawing) {
                return;
            }
            // cursor point
            const bx = event.clientX - this.$refs.canvas.offsetLeft;
            const by = event.clientY - this.$refs.canvas.offsetTop;

            if (
                this.websocket &&
                this.websocket.readyState === WebSocket.OPEN
            ) {
                this.websocket.send(
                    JSON.stringify({ action: "draw", point: { x: bx, y: by } })
                );
            } else {
                this.path.add(new paper.Point(bx, by));
                this.path.smooth({ type: "continuous" });
            }
        },
        stopDrawing() {
            if (!this.path) {
                return;
            }
            if (
                this.websocket &&
                this.websocket.readyState === WebSocket.OPEN
            ) {
                this.websocket.send(JSON.stringify({ action: "stopDrawing" }));
            } else {
                this.isDrawing = false;
                this.path.simplify();
                const blendMode = this.path.blendMode;
                this.path.blendMode = "normal";
                let raster = this.path.rasterize();
                this.path.remove();
                raster.blendMode = blendMode;
            }

            paper.view.draw();
        },
        handleReceivedData(data) {
            // Reconstruct the path from received data
            switch (data.action) {
                case "startDrawing": {
                    const receivedPath = new paper.Path({
                        strokeColor: data.path.strokeColor,
                        strokeWidth: data.path.strokeWidth,
                        opacity: data.path.opacity,
                        strokeCap: "round",
                        blendMode: data.path.blendMode,
                    });
                    this.receivedPaths[data.id] = receivedPath;
                    break;
                }
                case "draw": {
                    if (this.receivedPaths[data.id]) {
                        this.receivedPaths[data.id].add(
                            new paper.Point(data.point.x, data.point.y)
                        );
                        this.receivedPaths[data.id].smooth({
                            type: "continuous",
                        });
                    }
                    break;
                }
                case "stopDrawing": {
                    if (this.receivedPaths[data.id]) {
                        this.receivedPaths[data.id].simplify();
                        const blendMode = this.receivedPaths[data.id].blendMode;
                        this.receivedPaths[data.id].blendMode = "normal";

                        let raster = this.receivedPaths[data.id].rasterize();
                        raster.blendMode = blendMode;
                        this.receivedPaths[data.id].remove();
                        this.receivedPaths[data.id] = null;
                        paper.view.draw();
                        break;
                    }
                }
            }
        },
        downloadCanvas() {
            console.log("downloading...");
            const canvas = this.$refs.canvas;
            if (!canvas) {
                console.error("Canvas element is not available.");
                return;
            }
            const dataURL = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = "canvas-image.png"; // Default file name
            link.click();
        },
    },
};
</script>

<style scoped>
canvas {
    position: fixed;
    /* top: 0;
    left: 0; */
    z-index: 0;
}
#canvas {
    background-color: transparent;
}

#background {
    z-index: -1;
    background-color: white;
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
}
</style>
