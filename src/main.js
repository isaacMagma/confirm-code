import './style.css'

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".confirm-code__wrapper input");
  const inputArray = Array.from(inputs);
  const container = document.querySelector(".confirm-code__wrapper");
  let maskTimer = null; // Timer to mask all inputs after inactivity

  // Initially, force all inputs to be of type "password"
  inputArray.forEach((input) => {
    input.setAttribute("type", "password");
  });

  // Reset the masking timer on user activity.
  // If no activity occurs for 3 seconds on a focused input, mask all inputs.
  function resetMaskTimer() {
    if (maskTimer) {
      clearTimeout(maskTimer);
      maskTimer = null;
    }
    // Only start the timer if an input within the container is focused.
    if (container.contains(document.activeElement)) {
      maskTimer = setTimeout(() => {
        inputArray.forEach((input) => (input.type = "password"));
      }, 3000);
    }
  }

  // Function to update input types based on current focus and filled state:
  // - If the focused input is empty, the last filled input shows its value.
  // - If there are no empty inputs, only the focused input shows its value.
  // - If no input is focused, all inputs remain masked.
  function updateInputTypes() {
    const focusedElement = document.activeElement;
    if (!container.contains(focusedElement)) {
      inputArray.forEach(input => input.type = "password");
      return;
    }

    // Check if there's any empty input.
    const hasEmpty = inputArray.some(input => !input.value);

    if (hasEmpty) {
      // If there's an empty input, show the last filled input.
      let lastFilledIndex = -1;
      inputArray.forEach((input, index) => {
        if (input.value !== "") {
          lastFilledIndex = index;
        }
      });
      inputArray.forEach((input, index) => {
        input.type = index === lastFilledIndex ? "text" : "password";
      });
    } else {
      // If all inputs are filled, only the focused input shows its value.
      inputArray.forEach(input => {
        input.type = (input === focusedElement) ? "text" : "password";
      });
    }
  }

  inputArray.forEach((input, index) => {
    // Set helpful attributes for numeric input
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("pattern", "[0-9]*");

    input.addEventListener("keydown", (e) => {
      // Allow control keys
      if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
        resetMaskTimer();
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
      resetMaskTimer();
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

      updateInputTypes();
      resetMaskTimer();
    });

    // Enforce sequential filling for empty inputs.
    // Allow editing of already filled inputs even if there are empty ones.
    input.addEventListener("focus", () => {
      // If the focused input is empty, redirect focus to the first empty input.
      if (!input.value) {
        const firstEmpty = inputArray.find((el) => !el.value);
        if (firstEmpty && firstEmpty !== input) {
          firstEmpty.focus();
        }
      }
      updateInputTypes();
      resetMaskTimer();
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
        updateInputTypes();
        resetMaskTimer();
      }
    });
  });

  // When focus leaves the confirm-code container, mask all inputs and clear the timer.
  container.addEventListener("focusout", () => {
    // Delay execution to allow the new focused element to be set.
    setTimeout(() => {
      if (!container.contains(document.activeElement)) {
        inputArray.forEach((input) => (input.type = "password"));
        if (maskTimer) {
          clearTimeout(maskTimer);
          maskTimer = null;
        }
      }
    }, 0);
  });
});
