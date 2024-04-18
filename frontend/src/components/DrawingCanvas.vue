<template>
    <div>
        <canvas
            ref="canvas"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
        ></canvas>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isDrawing: false,
            ctx: null,
            lastX: [],
            lastY: [],
            lazyRadius: 10,
            smoothing: "bezier",
        };
    },
    mounted() {
        this.$refs.canvas.width = 1920;
        this.$refs.canvas.height = 1080;
        this.$refs.canvas.left = (window.innerWidth - 1920) / 2;
        this.$refs.canvas.top = (window.innerHeight - 1080) / 2;
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
            console.log("darwing");

            // cursor point
            const x = event.clientX - this.$refs.canvas.offsetLeft;
            const y = event.clientY - this.$refs.canvas.offsetTop;

            // calculating bx, by
            // (brushX and brushY, which accounts for a lazy radius)
            const dx = x - this.lastX[0];
            const dy = y - this.lastY[0];
            const dist = (dx ** 2 + dy ** 2) ** 0.5;
            if (dist < this.lazyRadius) return;
            const proportion = (dist - this.lazyRadius) / dist;
            const bx = this.lastX[0] + dx * proportion;
            const by = this.lastY[0] + dy * proportion;

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
    background-color: white;
    z-index: 0;
}
</style>
