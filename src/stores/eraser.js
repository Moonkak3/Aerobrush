import { defineStore } from "pinia";

export const eraserStore = defineStore("eraser", {
    state: () => {
        return {
            color: "#000000",
            size: 20,
            opacity: 1,
        };
    },
});
