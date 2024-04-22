<template>
    <div class="cursor">
        <!-- Your cursor content here -->
    </div>
</template>

<script>
import { handCursorStore } from "@/stores/handCursor";

export default {
    name: "HandCursor",
    data() {
        return {
            handCursor: handCursorStore(),
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
            if (this.handCursor.mode === "draw") {
                cursor.style.backgroundColor = "#000000";
                cursor.style.borderColor = "#ffffff";
            } else if (this.handCursor.mode === "erase") {
                cursor.style.backgroundColor = "transparent";
                cursor.style.borderColor = "#000000";
            }
            

            cursor.style.left = event.clientX + "px";
            cursor.style.top = event.clientY + "px";
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
    z-index: 99999;
    // transition: 50ms;
}
</style>
