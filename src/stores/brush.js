import { defineStore } from "pinia";

export const brushStore = defineStore("brush", {
    state: () => {
        return {
            color: "#000000",
            size: 10,
            opacity: 1,
        };
    },
});
