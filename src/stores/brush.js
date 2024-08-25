import { defineStore } from "pinia";

export const brushStore = defineStore("brush", {
    state: () => {
        return {
            color: "#0000FF",
            size: 10,
            opacity: 0.5,
        };
    },
});
