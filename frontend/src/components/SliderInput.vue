<template>
    <div class="slider">
        <div ref="track" class="track" @mousedown="startSliding">
            <div
                ref="thumb"
                class="thumb"
                :style="{ bottom: `${valuePercentage}%` }"
            ></div>
            <div
                ref="progress"
                class="progress"
                :style="{ height: `${valuePercentage}%` }"
            ></div>
        </div>
        <div class="value">{{ value }}</div>
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
            isSliding: false,
            startX: 0,
            startValue: this.min,
        };
    },
    computed: {
        valuePercentage() {
            return (
                ((this.value - this.min) /
                    (this.max - this.min)) *
                100
            );
        },
    },
    mounted() {
        window.addEventListener("mousemove", this.slide);
        window.addEventListener("mouseup", this.stopSliding);
    },
    beforeUnmount() {
        window.removeEventListener("mousemove", this.slide);
        window.removeEventListener("mouseup", this.stopSliding);
    },
    methods: {
        startSliding(event) {
            this.isSliding = true;
            this.startY = event.clientY;
            this.startValue = this.value;
        },
        slide(event) {
            if (!this.isSliding) return;

            const trackHeight = this.$refs.track.clientHeight;
            const delta = this.startY - event.clientY;
            const newValue = Math.max(
                this.min,
                Math.min(
                    this.max,
                    this.startValue +
                        (delta / trackHeight) * (this.max - this.min)
                )
            );
            const closestStep = Math.round(newValue / this.step) * this.step;

            this.value = Math.max(this.min, Math.min(this.max, closestStep));
        },
        stopSliding() {
            this.isSliding = false;
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/stylesheets/main.scss";
.slider {
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
}
.track {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.2);
}
.thumb {
    position: absolute;
    transform: translate(0%, 50%) scaleX(1.2);
    height: 20px;
    width: 100%;
    background-color: rgb(200, 200, 200);
    z-index: 9;
}
.progress {
    position: absolute;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.4);
    bottom: 0;
}
</style>
