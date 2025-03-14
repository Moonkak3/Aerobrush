let isMouseDownLeft = false;
let isMouseDownRight = false;
let currentElement = null;
let mouseDownElementLeft = null;
let mouseDownElementRight = null;

function handleCursor(x, y, clicked, handedness) {
    const element = document.elementFromPoint(x, y);
    if (!element) return;

    // Create a new mouse event object for mousemove
    const mouseMoveEvent = new MouseEvent("mousemove", {
        clientX: x,
        clientY: y,
        view: window,
        bubbles: true,
        cancelable: true,
    });
    mouseMoveEvent.handedness = handedness;

    // Dispatch the mousemove event
    element.dispatchEvent(mouseMoveEvent);

    // If the current element is different from the previous one
    if (element !== currentElement) {
        if (currentElement) {
            const mouseOutEvent = new MouseEvent("mouseout", {
                clientX: x,
                clientY: y,
                view: window,
                bubbles: true,
                cancelable: true,
                relatedTarget: element,
            });
            mouseOutEvent.handedness = handedness;

            // Dispatch the mouseout event on the previous element
            currentElement.dispatchEvent(mouseOutEvent);
        }

        if (element) {
            const mouseOverEvent = new MouseEvent("mouseover", {
                clientX: x,
                clientY: y,
                view: window,
                bubbles: true,
                cancelable: true,
                relatedTarget: currentElement,
            });
            mouseOverEvent.handedness = handedness;

            // Dispatch the mouseover event on the new element
            element.dispatchEvent(mouseOverEvent);
        }

        currentElement = element;
    }

    // If clicked is true and the mouse button was not previously down for the given hand
    if (clicked) {
        if (handedness === "Left" && !isMouseDownLeft) {
            isMouseDownLeft = true;
            mouseDownElementLeft = element; // Store the element where the left mousedown occurred
            const mouseDownEvent = new MouseEvent("mousedown", {
                clientX: x,
                clientY: y,
                view: window,
                bubbles: true,
                cancelable: true,
            });
            mouseDownEvent.handedness = handedness;

            // Dispatch the mousedown event
            element.dispatchEvent(mouseDownEvent);
        } else if (handedness === "Right" && !isMouseDownRight) {
            isMouseDownRight = true;
            mouseDownElementRight = element; // Store the element where the right mousedown occurred
            const mouseDownEvent = new MouseEvent("mousedown", {
                clientX: x,
                clientY: y,
                view: window,
                bubbles: true,
                cancelable: true,
            });
            mouseDownEvent.handedness = handedness;

            // Dispatch the mousedown event
            element.dispatchEvent(mouseDownEvent);
        }
    }

    // If clicked is false and the mouse button was previously down for the given hand
    if (!clicked) {
        if (handedness === "Left" && isMouseDownLeft) {
            isMouseDownLeft = false;

            const mouseUpEvent = new MouseEvent("mouseup", {
                clientX: x,
                clientY: y,
                view: window,
                bubbles: true,
                cancelable: true,
            });
            mouseUpEvent.handedness = handedness;

            // Dispatch the mouseup event
            element.dispatchEvent(mouseUpEvent);

            // Dispatch the click event only if the mouseup occurred on the same element as the mousedown
            if (element === mouseDownElementLeft) {
                const clickEvent = new MouseEvent("click", {
                    clientX: x,
                    clientY: y,
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });

                clickEvent.handedness = handedness;
                // Dispatch the click event
                element.dispatchEvent(clickEvent);
            }

            mouseDownElementLeft = null; // Reset the mouseDownElement for the left hand
        } else if (handedness === "Right" && isMouseDownRight) {
            isMouseDownRight = false;

            const mouseUpEvent = new MouseEvent("mouseup", {
                clientX: x,
                clientY: y,
                view: window,
                bubbles: true,
                cancelable: true,
            });
            mouseUpEvent.handedness = handedness;

            // Dispatch the mouseup event
            element.dispatchEvent(mouseUpEvent);

            // Dispatch the click event only if the mouseup occurred on the same element as the mousedown
            if (element === mouseDownElementRight) {
                const clickEvent = new MouseEvent("click", {
                    clientX: x,
                    clientY: y,
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });

                clickEvent.handedness = handedness;
                // Dispatch the click event
                element.dispatchEvent(clickEvent);
            }

            mouseDownElementRight = null; // Reset the mouseDownElement for the right hand
        }
    }
}

export { handleCursor };
