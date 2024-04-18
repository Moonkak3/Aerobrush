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
        };
    },
    mounted() {
        this.$refs.canvas.width = 1920;
        this.$refs.canvas.height = 1080;
        this.$refs.canvas.left = (window.innerWidth - 1920) / 2;
        this.$refs.canvas.top = (window.innerHeight - 1080) / 2;
        this.ctx = this.$refs.canvas.getContext("2d");
    },
    methods: {
        startDrawing(event) {
            this.isDrawing = true;
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
            const x = event.clientX - this.$refs.canvas.offsetLeft;
            const y = event.clientY - this.$refs.canvas.offsetTop;

            this.ctx.shadowColor = "rgba(0,0,0,.5)";
            this.ctx.shadowBlur = 2;
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "#000000";

            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX[2], this.lastY[2]);
            this.ctx.bezierCurveTo(
                this.lastX[1],
                this.lastY[1],
                this.lastX[0],
                this.lastY[0],
                x,
                y
            );
            this.ctx.stroke();

            this.lastX.unshift(x);
            this.lastY.unshift(y);
            while (this.lastX.length > 3) {
                this.lastX.pop();
            }
            while (this.lastY.length > 3) {
                this.lastY.pop();
            }
        },
        stopDrawing() {
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
