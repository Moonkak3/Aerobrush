<template>
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <Toast class="UI" />
    <div class="background">
        <HandCursor class="cursor" />
        <BrushSettings class="UI" />
        <LiveWebStream class="UI" />
        <TaskBar class="UI" />
        <DrawingCanvas class="drawing-canvas" />
    </div>
</template>

<script>
import LiveWebStream from "./components/LiveWebStream.vue";
import BrushSettings from "./components/BrushSettings.vue";
import HandCursor from "./components/HandCursor.vue";
import DrawingCanvas from "./components/DrawingCanvas.vue";
import TaskBar from "./components/TaskBar.vue";
import Toast from "primevue/toast";

document.body.style.cursor = "none";
export default {
    name: "App",
    components: {
        BrushSettings,
        LiveWebStream,
        HandCursor,
        DrawingCanvas,
        TaskBar,
        Toast,
    },
};
</script>

<style lang="scss" scoped>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    // color: #2c3e50;
    // margin-top: 60px;
}
.UI {
    z-index: 9;
}
.cursor {
    z-index: 99;
}
.drawing-canvas {
    z-index: 5;
}
.background {
    background-color: rgb(36, 39, 41);
}
</style>
