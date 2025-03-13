<template>
    <div
        class="container"
        id="panArea"
        ref="panArea"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
    >
        <canvas
            id="canvas"
            ref="canvas"
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

            panInitialZoom: null,
            panInitalAngle: null,
            panInitialOffsetX: null,
            panInitialOffsetY: null,

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
            switch (this.handCursor.mode) {
                case "draw":
                    this.path = new paper.Path({
                        strokeColor: this.brush.color,
                        strokeWidth: this.brush.size,
                        strokeJoin: "round",
                        opacity: this.brush.opacity,
                        strokeCap: "round",
                        blendMode: "normal",
                    });
                    break;
                case "erase":
                    this.path = new paper.Path({
                        strokeColor: this.eraser.color,
                        strokeWidth: this.eraser.size,
                        strokeJoin: "round",
                        opacity: this.eraser.opacity,
                        strokeCap: "round",
                        blendMode: "destination-out",
                    });
                    break;
                default:
                    break;
            }
            this.isDrawing = true;
            paper.view.draw();
        },
        draw(event) {
            if (!this.isDrawing) {
                return;
            }
            if (this.handCursor.isLeftDown) {
                if (
                    this.panInitialOffsetX == null ||
                    this.panInitialOffsetY == null
                ) {
                    this.panInitialOffsetX =
                        this.$refs.canvas.offsetLeft - this.handCursor.leftX;
                    this.panInitialOffsetY =
                        this.$refs.canvas.offsetTop - this.handCursor.leftY;
                } else {
                    this.$refs.canvas.style.left = `${
                        this.panInitialOffsetX + this.handCursor.leftX
                    }px`;
                    this.$refs.canvas.style.top = `${
                        this.panInitialOffsetY + this.handCursor.leftY
                    }px`;
                    this.$refs.background.style.left = `${
                        this.panInitialOffsetX + this.handCursor.leftX
                    }px`;
                    this.$refs.background.style.top = `${
                        this.panInitialOffsetY + this.handCursor.leftY
                    }px`;
                }
                if (this.handCursor.isRightDown) {
                    if (
                        this.panInitalAngle == null ||
                        this.panInitialZoom == null
                    ) {
                        this.panInitalAngle = Math.atan2(
                            this.handCursor.rightY - this.handCursor.leftY,
                            this.handCursor.rightX - this.handCursor.leftX
                        );
                        this.panInitialZoom = Math.sqrt(
                            Math.pow(
                                this.handCursor.rightX - this.handCursor.leftX,
                                2
                            ) +
                                Math.pow(
                                    this.handCursor.rightY -
                                        this.handCursor.leftY,
                                    2
                                )
                        );
                    } else {
                        const angle = Math.atan2(
                            this.handCursor.rightY - this.handCursor.leftY,
                            this.handCursor.rightX - this.handCursor.leftX
                        );
                        const zoom = Math.sqrt(
                            Math.pow(
                                this.handCursor.rightX - this.handCursor.leftX,
                                2
                            ) +
                                Math.pow(
                                    this.handCursor.rightY -
                                        this.handCursor.leftY,
                                    2
                                )
                        );

                        const rotation = angle - this.panInitalAngle;
                        const scale = zoom / this.panInitialZoom;

                        this.$refs.canvas.style.transform = `rotate(${rotation}rad) scale(${scale})`;
                        this.$refs.background.style.transform = `rotate(${rotation}rad) scale(${scale})`;
                    }
                } else {
                    this.panInitalAngle = null;
                    this.panInitialZoom = null;
                }
            } else {
                // cursor point
                const bx = event.clientX - this.$refs.canvas.offsetLeft;
                const by = event.clientY - this.$refs.canvas.offsetTop;

                this.path.add(new paper.Point(bx, by));
                this.path.smooth({
                    type: "catmull-rom",
                    factor: 1,
                    from: -Math.min(10, this.path.segments.length),
                    to: -1,
                });
            }
        },
        stopDrawing() {
            this.isDrawing = false;
            if (!this.path) {
                return;
            }
            const blendMode = this.path.blendMode;
            this.path.blendMode = "normal";
            let raster = this.path.rasterize();
            this.path.remove();
            raster.blendMode = blendMode;

            paper.view.draw();
            this.panInitialOffsetX = null;
            this.panInitialOffsetY = null;
            this.panInitalAngle = null;
            this.panInitialZoom = null;
        },
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
