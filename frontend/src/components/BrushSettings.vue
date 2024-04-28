<template>
    <div class="container">
        <SliderInput
            v-model="opacity"
            :min="0"
            :max="1"
            :step="0.01"
        />
        <SliderInput
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
.container {
    position: absolute;
    transform: translate(0, -50%);
    top: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100px;
    height: 70%;
}
:deep(.p-slider) {
    margin: 2rem;
    width: 20px;
    height: 40%;
}
:deep(.p-slider-handle) {
    transform: scale(150%);
}
</style>
