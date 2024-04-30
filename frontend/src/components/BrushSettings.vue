<template>
    <div class="container">
        <SliderInput
            class="opacity"
            v-model="opacity"
            :min="0"
            :max="1"
            :step="0.01"
        />
        <color-input v-model="color" disable-alpha position="left center"/>
        <SliderInput
            class="size"
            v-model="size"
            :min="1"
            :max="100"
            :step="1"
        />
    </div>
</template>

<script>
import { handCursorStore } from "@/stores/handCursor";
import { brushStore } from "@/stores/brush";
import { eraserStore } from "@/stores/eraser";
import { watch } from "vue";
import ColorInput from "vue-color-input";
import SliderInput from "@/components/SliderInput.vue";

export default {
    components: {
        SliderInput,
        ColorInput,
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
:deep(.color-input) {
    /* make clickable box a 100x100 circle */
    width: 100%;
    border-radius: 12px;
    margin: 12px;
}
:deep(.color-input.user) {
    .box {
        width: 100%;
        height: auto;
        aspect-ratio: 1;
    }
    .picker-popup {
        height: auto;
        width: 20vw;
        .saturation-area {
            aspect-ratio: 1;
            height: auto;
        }
    }
    // .slider {
    //     /* thin out the sliders and make them wider */
    //     height: 2px;
    //     width: 92%;
    // }
    // .saturation-area {
    //     /* bigger picking area */
    //     height: 150px;
    // }
    // .slider-pointer {
    //     /* make slider pointers square-ish and 10x10 */
    //     border-radius: 4px;
    //     width: 10px;
    //     height: 10px;
    // }
    // .saturation-pointer {
    //     /* increase saturation pointer size */
    //     width: 40px;
    //     height: 40px;
    // }
}
</style>
