<template>
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <HandCursor class="cursor" />
    <BrushSettings class="UI"/>
    <LiveWebStream class="UI"/>
    <DrawingCanvas />
</template>

<script>
import LiveWebStream from "./components/LiveWebStream.vue";
import BrushSettings from "./components/BrushSettings.vue";
import HandCursor from "./components/HandCursor.vue";
import DrawingCanvas from "./components/DrawingCanvas.vue";

document.body.style.cursor = "none";
export default {
    name: "App",
    components: {
        BrushSettings,
        LiveWebStream,
        HandCursor,
        DrawingCanvas,
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
</style>
