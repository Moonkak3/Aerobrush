<template>
    <div class="slider-input">
        <input
            type="range"
            v-model="value"
            :min="min"
            :max="max"
            :step="step"
            class="slider"
            @input="updateValue"
        />
        <div class="slider-value">{{ value }}</div>
    </div>
</template>

<script>
export default {
    name: "SliderInput",
    props: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 100,
        },
        step: {
            type: Number,
            default: 1,
        },
    },
    data() {
        return {
            value: this.min,
        };
    },
    methods: {
        updateValue(event) {
            this.value = event.target.value;
        },
        printTargetElement(event) {
            console.log(event);
        },
    },
    mounted() {
        document.addEventListener("mousedown", this.printTargetElement);
    },
};
</script>

<style scoped>
.slider-input {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.slider {
    width: 10px;
    height: 200px;
    /* transform: rotate(270deg); */
    -webkit-appearance: slider-vertical;
    appearance: slider-vertical;
}

.slider-value {
    margin-top: 10px;
}
</style>
