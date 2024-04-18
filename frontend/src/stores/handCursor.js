import { defineStore } from "pinia";

export const handCursorStore = defineStore("handCursor", {
    state: () => {
        return {
            click: false,
            clientX: 0,
            clientY: 0,
        };
    },
});
