<template>
    <div>
        <canvas
            id="canvas"
            ref="canvas"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
        ></canvas>
        <canvas id="background" ref="background"></canvas>
    </div>
</template>

<script>
import { handCursorStore } from "@/stores/handCursor";
export default {
    data() {
        return {
            isDrawing: false,
            ctx: null,
            lastX: [],
            lastY: [],
            lazyRadius: 10,
            smoothing: "bezier",
            handCursor: handCursorStore(),
        };
    },
    mounted() {
        this.$refs.canvas.width = 1920;
        this.$refs.canvas.height = 1080;
        this.$refs.canvas.left = (window.innerWidth - 1920) / 2;
        this.$refs.canvas.top = (window.innerHeight - 1080) / 2;
        this.$refs.background.width = 1920;
        this.$refs.background.height = 1080;
        this.$refs.background.left = (window.innerWidth - 1920) / 2;
        this.$refs.background.top = (window.innerHeight - 1080) / 2;
        this.ctx = this.$refs.canvas.getContext("2d");

        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = "#000000";
    },
    methods: {
        startDrawing(event) {
            this.isDrawing = true;
            this.lastX = [];
            this.lastY = [];
            this.lastX.unshift(event.clientX - this.$refs.canvas.offsetLeft);
            this.lastY.unshift(event.clientY - this.$refs.canvas.offsetTop);
            while (this.lastX.length > 3) {
                this.lastX.pop();
            }
            while (this.lastY.length > 3) {
                this.lastY.pop();
            }
        },
        draw(event) {
            if (!this.isDrawing) return;

            // cursor point
            const bx = event.clientX - this.$refs.canvas.offsetLeft;
            const by = event.clientY - this.$refs.canvas.offsetTop;

            if (this.handCursor.mode === "draw") {
                this.ctx.globalCompositeOperation = "source-over";
            } else if (this.handCursor.mode === "erase") {
                this.ctx.globalCompositeOperation = "destination-out";
            }

            this.ctx.beginPath();
            if (this.smoothing === "bezier") {
                this.ctx.moveTo(this.lastX[2], this.lastY[2]);
                this.ctx.bezierCurveTo(
                    this.lastX[1],
                    this.lastY[1],
                    this.lastX[0],
                    this.lastY[0],
                    bx,
                    by
                );
            } else if (this.smoothing === "quadratic") {
                this.ctx.moveTo(this.lastX[1], this.lastY[1]);
                this.ctx.quadraticCurveTo(this.lastX[0], this.lastY[0], bx, by);
            } else if (this.smoothing === "none") {
                this.ctx.moveTo(this.lastX[0], this.lastY[0]);
                this.ctx.lineTo(bx, by);
            }
            this.ctx.stroke();

            this.lastX.unshift(bx);
            this.lastY.unshift(by);
            while (this.lastX.length > 3) {
                this.lastX.pop();
            }
            while (this.lastY.length > 3) {
                this.lastY.pop();
            }
        },
        stopDrawing() {
            this.lastX = [];
            this.lastY = [];
            this.isDrawing = false;
        },
    },
};
</script>

<style scoped>
canvas {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
}
#canvas {
    background-color: transparent;
}

#background {
    z-index: -1;
    background-color: white;
}
</style>
