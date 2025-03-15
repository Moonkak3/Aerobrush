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
            isLeftDown: false, // Trust me its important. Need to make sure order of methods are correct.
            isRightDown: false, // Trust me its important. Need to make sure order of methods are correct.
            path: null,
            scale: 1,
            rotation: 0,
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
        paper.setup(this.$refs.canvas);
        this.$refs.canvas.width = 1920;
        this.$refs.canvas.height = 1080;
        this.$refs.background.width = 1920;
        this.$refs.background.height = 1080;
        this.scale = window.innerWidth / 2400;
        this.$refs.canvas.style.transform = `translate(-50%, -50%) scale(${this.scale})`;
        this.$refs.background.style.transform = `translate(-50%, -50%) scale(${this.scale})`;

        // Listen for the 'download' event on the event bus
        eventBus.on("download", this.downloadCanvas);
    },
    beforeUnmount() {
        paper.projects.forEach((project) => {
            project.remove();
        });
        // Remove the event listener on unmount
        eventBus.off("download", this.downloadCanvas);
    },
    methods: {
        startDrawing(event) {
            switch (event.handedness) {
                case "Left": // Left mouse button
                    this.isLeftDown = true;
                    break;
                default: // Right mouse button
                    this.isRightDown = true;

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
                    paper.view.draw();
                    break;
            }
            this.panInitialOffsetX =
                this.$refs.canvas.offsetLeft - this.handCursor.leftX;
            this.panInitialOffsetY =
                this.$refs.canvas.offsetTop - this.handCursor.leftY;

            this.panInitalAngle =
                Math.atan2(
                    this.handCursor.rightY - this.handCursor.leftY,
                    this.handCursor.rightX - this.handCursor.leftX
                ) - this.rotation;
            this.panInitialZoom =
                Math.sqrt(
                    Math.pow(
                        this.handCursor.rightX - this.handCursor.leftX,
                        2
                    ) +
                        Math.pow(
                            this.handCursor.rightY - this.handCursor.leftY,
                            2
                        )
                ) / this.scale;
        },
        draw(event) {
            if (this.isLeftDown && this.isRightDown) {
                const angle = Math.atan2(
                    this.handCursor.rightY - this.handCursor.leftY,
                    this.handCursor.rightX - this.handCursor.leftX
                );
                this.rotation = angle - this.panInitalAngle;

                const zoom = Math.sqrt(
                    Math.pow(
                        this.handCursor.rightX - this.handCursor.leftX,
                        2
                    ) +
                        Math.pow(
                            this.handCursor.rightY - this.handCursor.leftY,
                            2
                        )
                );
                this.scale = zoom / this.panInitialZoom;

                this.$refs.canvas.style.transform = `translate(-50%, -50%) rotate(${this.rotation}rad) scale(${this.scale})`;
                this.$refs.background.style.transform = `translate(-50%, -50%) rotate(${this.rotation}rad) scale(${this.scale})`;

                this.panInitialOffsetX =
                    this.$refs.canvas.offsetLeft - this.handCursor.leftX;
                this.panInitialOffsetY =
                    this.$refs.canvas.offsetTop - this.handCursor.leftY;
            } else {
                this.panInitalAngle = null;
                this.panInitialZoom = null;

                switch (event.handedness) {
                    case "Left": // Left mouse button
                        if (!this.isLeftDown) {
                            break;
                        }
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
                        break;
                    default: // Right mouse button
                        if (!this.isRightDown) {
                            break;
                        }
                        // Drawing functionality
                        {
                            // Right mouse button
                            if (!this.path) return;

                            // Calculate position relative to center (since transform origin is center)
                            const relativeX =
                                event.clientX - this.$refs.canvas.offsetLeft;
                            const relativeY =
                                event.clientY - this.$refs.canvas.offsetTop;

                            // Apply inverse rotation around the center
                            const cos = Math.cos(-this.rotation);
                            const sin = Math.sin(-this.rotation);
                            const rotatedX = relativeX * cos - relativeY * sin;
                            const rotatedY = relativeX * sin + relativeY * cos;

                            // Calculate center of the canvas
                            const centerX = this.$refs.canvas.width / 2;
                            const centerY = this.$refs.canvas.height / 2;

                            // Convert back to canvas coordinates and apply scale
                            const bx = rotatedX / this.scale + centerX;
                            const by = rotatedY / this.scale + centerY;

                            this.path.add(new paper.Point(bx, by));
                            this.path.smooth({
                                type: "catmull-rom",
                                factor: 1,
                                from: -Math.min(10, this.path.segments.length),
                                to: -1,
                            });
                        }
                        break;
                }
            }
        },
        stopDrawing(event) {
            switch (event.handedness) {
                case "Left": // Left mouse button
                    this.isLeftDown = false;
                    break;
                default: // Right mouse button
                    this.isRightDown = false;
                    {
                        if (!this.path) return;
                        const blendMode = this.path.blendMode;
                        this.path.blendMode = "normal";
                        let raster = this.path.rasterize();
                        this.path.remove();
                        raster.blendMode = blendMode;
                        paper.view.draw();
                    }
                    break;
            }

            this.panInitalAngle = null;
            this.panInitialZoom = null;
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
    width: 1920px;
    height: 1080px;
    top: 50vh;
    left: 50vw;
    z-index: 0;
    transform: translate(-50%, -50%);
    transform-origin: center center; /* This ensures rotation happens around center */
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
