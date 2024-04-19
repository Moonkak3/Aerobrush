import { defineStore } from "pinia";

export const handCursorStore = defineStore("handCursor", {
    state: () => {
        return {
            x: 0,
            y: 0,
            mode: "draw",
            lazyRadius: 0,
        };
    },
});
