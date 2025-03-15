<template>
    <div class="container">
        <Button
            :class="{ 'p-button-primary': handCursor.mode === 'draw' }"
            text
            aria-label="Draw"
            @click="selectButton('draw')"
        >
            <i class="pi pi-pencil"></i>
        </Button>
        <Button
            :class="{ 'p-button-primary': handCursor.mode === 'erase' }"
            text
            aria-label="Erase"
            @click="selectButton('erase')"
        >
            <i class="pi pi-eraser"></i>
        </Button>
        <!-- <Button
      :class="{ 'p-button-primary': handCursor.mode === 'pan' }"
      text
      rounded
      aria-label="Pan"
      @click="selectButton('pan')"
    >
      <i class="pi pi-arrows-alt"></i>
    </Button> -->
        <Button text aria-label="Download" @click="downloadCanvas">
            <i class="pi pi-download"></i>
        </Button>
        <Button text aria-label="Share" @click="share">
            <i class="pi pi-link" :value="link" ref="share"></i>
        </Button>
    </div>
</template>

<script>
import { defineComponent } from "vue";
import { handCursorStore } from "@/stores/handCursor";
import { eventBus } from "@/assets/scripts/eventBus";
import { useToast } from "primevue/usetoast";

import Button from "primevue/button";

export default defineComponent({
    components: {
        Button,
    },
    data() {
        return { toast: null };
    },
    setup() {
        const handCursor = handCursorStore();

        const selectButton = (buttonType) => {
            handCursor.mode = buttonType;
        };

        return {
            handCursor,
            selectButton,
        };
    },
    mounted() {
        this.toast = useToast();
    },
    computed: {
        link() {
            return window.location.href;
        },
    },
    methods: {
        downloadCanvas() {
            console.log("clicked download");
            eventBus.emit("download");
            this.toast.add({
                severity: "contrast",
                summary: "Downloading whiteboard as PNG",
                detail: "Check your downloads folder for the image file",
                life: 5000,
            });
        },
        share() {
            var textArea = document.createElement("textarea");
            textArea.value = window.location.href;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                var successful = document.execCommand("copy");
                if (successful) {
                    this.toast.add({
                        severity: "contrast",
                        summary: "Link copied successfully!",
                        detail: `Share this fun drawing-webapp with your friends and family :)`,
                        life: 5000,
                    });
                }
                var msg = successful ? "successful" : "unsuccessful";
                console.log("Fallback: Copying text command was " + msg);
            } catch (err) {
                console.error("Fallback: Oops, unable to copy", err);
            }

            document.body.removeChild(textArea);
        },
    },
});
</script>

<style lang="scss" scoped>
@import "../assets/stylesheets/main.scss";

.container {
    position: absolute;
    transform: translate(-50%, 0);
    left: 50%;
    bottom: 0;
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: 10px;
    justify-content: center;
    align-items: center;
    background-color: $body-color;
    padding: 12px;
    margin: 12px;
    border-radius: 12px;
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 20px;
}
.pi {
    font-size: 2rem;
    padding: 4px;
    border-radius: 12px;
}
.p-button-primary {
    background-color: white;
    color: black;
}
.p-button {
    border-color: transparent;
    border-width: 3px;
}
.p-button-text:not(:disabled):hover {
    border-color: white;
    border-width: 3px;
}
</style>
