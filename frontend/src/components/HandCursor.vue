<template>
    <div class="cursor">
        <!-- Your cursor content here -->
    </div>
</template>

<script>
export default {
    name: "HandCursor",
    data() {
        return {
            lastX: 0,
            lastY: 0,
            lazyRadius: 10,
        };
    },
    mounted() {
        // Add event listeners to track cursor movement
        document.addEventListener("mousemove", this.handleMouseMove);
    },
    beforeUnmount() {
        // Remove event listeners when component is unmounted
        document.removeEventListener("mousemove", this.handleMouseMove);
    },
    methods: {
        handleMouseMove(event) {
            // Update cursor position based on mouse movement
            const cursor = document.querySelector(".cursor");

            // calculating bx, by
            // (brushX and brushY, which accounts for a lazy radius)
            const dx = event.clientX - this.lastX;
            const dy = event.clientY - this.lastY;
            const dist = (dx ** 2 + dy ** 2) ** 0.5;

            if (dist < this.lazyRadius) return;

            const proportion = (dist - this.lazyRadius) / dist;
            const bx = this.lastX + dx * proportion;
            const by = this.lastY + dy * proportion;

            cursor.style.left = bx + "px";
            cursor.style.top = by + "px";

            this.lastX = bx;
            this.lastY = by;
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/stylesheets/main.scss";
.cursor {
    position: fixed;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: $primary-color;
    border-color: white;
    border-width: 2px;
    border-style: solid;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    // transition: 50ms;
}
</style>
