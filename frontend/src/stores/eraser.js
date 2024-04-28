import { defineStore } from "pinia";

export const eraserStore = defineStore("eraser", {
    state: () => {
        return {
            color: "#0000FF",
            size: 20,
            opacity: 1,
        };
    },
});
