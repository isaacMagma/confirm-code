import './style.css'

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".confirm-code__wrapper input");
  const inputArray = Array.from(inputs);
  const container = document.querySelector(".confirm-code__wrapper");

  // Initially, force all inputs to be of type "password"
  inputArray.forEach((input) => {
    input.setAttribute("type", "password");
  });

  // Function to update input types:
  // Only the last filled input is visible (type="text") if an input is focused,
  // otherwise (when no input is focused) all remain masked.
  function updateInputTypes() {
    let lastFilledIndex = -1;
    inputArray.forEach((input, index) => {
      if (input.value !== "") {
        lastFilledIndex = index;
      }
    });

    inputArray.forEach((input, index) => {
      // Only show the last filled input as text if an input is focused
      if (container.contains(document.activeElement)) {
        input.type = index === lastFilledIndex ? "text" : "password";
      } else {
        // Mask all inputs when no input is focused
        input.type = "password";
      }
    });
  }

  inputArray.forEach((input, index) => {
    // Set helpful attributes for numeric input
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("pattern", "[0-9]*");

    input.addEventListener("keydown", (e) => {
      // Allow control keys
      if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
        return;
      }
      // If a digit key is pressed and the input already has a value,
      // clear it immediately to allow overwriting (unless text is selected).
      if (/^[0-9]$/.test(e.key) && input.value !== "" && input.selectionStart === input.selectionEnd) {
        input.value = "";
      }
      // Allow only single digits (0-9)
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("input", () => {
      // Remove any non-digit characters
      input.value = input.value.replace(/[^0-9]/g, "");

      // Ensure that only one digit is stored
      if (input.value.length > 1) {
        input.value = input.value.slice(0, 1);
      }

      // Clear all inputs after this one.
      for (let i = index + 1; i < inputArray.length; i++) {
        inputArray[i].value = "";
      }

      // If this input is now filled, focus the next empty input (if any)
      if (input.value.length === 1) {
        const nextEmpty = inputArray.find((el, idx) => idx > index && !el.value);
        if (nextEmpty) {
          nextEmpty.focus();
        }
      }

      // Update input types to reflect masking/visibility
      updateInputTypes();
    });

    // Enforce sequential filling only for empty inputs.
    // Allow editing of already filled inputs even if there are empty ones.
    input.addEventListener("focus", () => {
      // Only redirect if the input is empty.
      if (!input.value) {
        const firstEmpty = inputArray.find((el) => !el.value);
        if (firstEmpty && firstEmpty !== input) {
          firstEmpty.focus();
        }
      }
      // Update input types on focus change
      updateInputTypes();
    });

    // When a digit is deleted, move focus to the last filled input.
    input.addEventListener("keyup", (e) => {
      if (["Backspace", "Delete"].includes(e.key)) {
        if (input.value === "") {
          for (let i = index - 1; i >= 0; i--) {
            if (inputArray[i].value !== "") {
              inputArray[i].focus();
              break;
            }
          }
        }
        // Update the input types after deletion
        updateInputTypes();
      }
    });
  });

  // When focus leaves the confirm-code container, mask all inputs.
  container.addEventListener("focusout", () => {
    // Delay execution to allow the new focused element to be set
    setTimeout(() => {
      if (!container.contains(document.activeElement)) {
        // No input in the container has focus; mask all inputs.
        inputArray.forEach((input) => (input.type = "password"));
      }
    }, 0);
  });
});
