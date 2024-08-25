import { createApp } from "vue";
import ToastService from "primevue/toastservice";
import App from "./App.vue";

import { createPinia } from "pinia";

import PrimeVue from "primevue/config";
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

import Buefy from "buefy";
import "buefy/dist/buefy.css";
import "primeicons/primeicons.css";

const pinia = createPinia();
const app = createApp(App);

app.use(ToastService);
app.use(pinia);

const Noir = definePreset(Aura, {
    semantic: {
        primary: {
            50: "{zinc.50}",
            100: "{zinc.100}",
            200: "{zinc.200}",
            300: "{zinc.300}",
            400: "{zinc.400}",
            500: "{zinc.500}",
            600: "{zinc.600}",
            700: "{zinc.700}",
            800: "{zinc.800}",
            900: "{zinc.900}",
            950: "{zinc.950}",
        },
        colorScheme: {
            light: {
                primary: {
                    color: "{zinc.950}",
                    inverseColor: "#ffffff",
                    hoverColor: "{zinc.900}",
                    activeColor: "{zinc.800}",
                },
                highlight: {
                    background: "{zinc.950}",
                    focusBackground: "{zinc.700}",
                    color: "#ffffff",
                    focusColor: "#ffffff",
                },
            },
            dark: {
                primary: {
                    color: "{zinc.950}",
                    inverseColor: "#ffffff",
                    hoverColor: "{zinc.900}",
                    activeColor: "{zinc.800}",
                },
                highlight: {
                    background: "{zinc.950}",
                    focusBackground: "{zinc.700}",
                    color: "#ffffff",
                    focusColor: "#ffffff",
                },
            },
        },
    },
});

app.use(PrimeVue, {
    theme: {
        preset: Noir,
    },
});
app.use(Buefy);

app.mount("#app");
