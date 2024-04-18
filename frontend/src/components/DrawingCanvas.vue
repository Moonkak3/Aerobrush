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
            context: null,
            lastX: 0,
            lastY: 0,
        };
    },
    mounted() {
        this.$refs.canvas.width = 1920;
        this.$refs.canvas.height = 1080;
        this.$refs.canvas.left = (window.innerWidth - 1920) / 2;
        this.$refs.canvas.top = (window.innerHeight - 1080) / 2;
        this.context = this.$refs.canvas.getContext("2d");
    },
    methods: {
        startDrawing(event) {
            this.isDrawing = true;
            this.lastX = event.clientX - this.$refs.canvas.offsetLeft;
            this.lastY = event.clientY - this.$refs.canvas.offsetTop;
        },
        draw(event) {
            if (!this.isDrawing) return;
            console.log("darwing");
            const x = event.clientX - this.$refs.canvas.offsetLeft;
            const y = event.clientY - this.$refs.canvas.offsetTop;

            this.context.beginPath();
            this.context.moveTo(this.lastX, this.lastY);
            this.context.lineTo(x, y);
            this.context.strokeStyle = "red";
            this.context.lineWidth = 5;
            this.context.stroke();

            this.lastX = x;
            this.lastY = y;
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
