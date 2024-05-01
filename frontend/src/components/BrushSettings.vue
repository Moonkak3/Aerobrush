<template>
    <div class="container">
        <SliderInput
            class="size"
            v-model="currentMode.size"
            :min="1"
            :max="100"
            :step="1"
        />
        <b-colorpicker
            v-model="this.brush.color"
            :position="'is-top-left'"
            :representation="'triangle'"
        />

        <SliderInput
            class="opacity"
            v-model="currentMode.opacity"
            :min="0"
            :max="1"
            :step="0.01"
        />
    </div>
</template>

<script>
import { handCursorStore } from "@/stores/handCursor";
import { brushStore } from "@/stores/brush";
import { eraserStore } from "@/stores/eraser";
import { watch } from "vue";
import SliderInput from "@/components/SliderInput.vue";

export default {
    components: {
        SliderInput,
    },
    data() {
        return {
            handCursor: handCursorStore(),
            brush: brushStore(),
            eraser: eraserStore(),
            opacity: 1,
            size: 5,
            color: "#0000FF",
        };
    },
    computed: {
        currentMode() {
            if (this.handCursor.mode === "draw") {
                return this.brush;
            } else if (this.handCursor.mode === "erase") {
                return this.eraser;
            }
            return this.brush;
        },
    },
    mounted() {
        this.unwatchHandCursor = watch(this.handCursor, (newState) => {
            if (newState.mode === "draw") {
                this.opacity = this.brush.opacity;
                this.size = this.brush.size;
            } else if (newState.mode == "erase") {
                this.opacity = this.eraser.opacity;
                this.size = this.eraser.size;
            }
        });
    },
    beforeUnmount() {
        // Stop watching when the component is unmounted
        this.unwatchHandCursor();
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/stylesheets/main.scss";
.container {
    position: absolute;
    transform: translate(0, -50%);
    top: 50%;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: $body-color;

    width: 80px;
    height: 70%;
    padding: 12px;
    margin: 12px;
    border-radius: 12px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
:deep(.colorpicker) {
    /* make clickable box a 100x100 circle */
    width: 100%;
    margin: 12px;

    .dropdown {
        display: flex;
        width: 100%;
        aspect-ratio: 1;
        .dropdown-trigger {
            display: flex;
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            * {
                display: flex;
                width: 100%;
                height: auto;
                aspect-ratio: 1;
            }
            span {
                display: none;
            }
            button {
                border-radius: 5px;
            }
        }
        .dropdown-menu {
            transform: translate(0%, -50%);
            top: 0;
            bottom: auto;
            right: 150%;
            left: auto;

            svg.b-colorpicker-triangle {
                width: auto;
                height: 50vh;
                aspect-ratio: 1;
            }
        }
    }
}
</style>
