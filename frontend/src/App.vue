<template>
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <HandCursor />
    <LiveWebStream msg="Welcome to Your Vue.js App" />
    <DrawingCanvas />
</template>

<script>
import LiveWebStream from "./components/LiveWebStream.vue";
import HandCursor from "./components/HandCursor.vue";
import DrawingCanvas from "./components/DrawingCanvas.vue";

export default {
    name: "App",
    components: {
        LiveWebStream,
        HandCursor,
        DrawingCanvas,
    },
};
</script>

<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    // color: #2c3e50;
    margin-top: 60px;
}
</style>
