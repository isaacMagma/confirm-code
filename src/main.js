import './style.css'

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".confirm-code__wrapper input");
  const inputArray = Array.from(inputs);
  const container = document.querySelector(".confirm-code__wrapper");

  // Initially, force all inputs to be of type "password"
  inputArray.forEach((input) => {
    input.setAttribute("type", "password");
  });

  // Function to update input types based on current focus and filled state:
  // - If the focused input is empty, show the last filled input's value.
  // - If there are no empty inputs, show only the focused input's value.
  // - If no input is focused, mask all inputs.
  function updateInputTypes() {
    const focusedElement = document.activeElement;
    if (!container.contains(focusedElement)) {
      inputArray.forEach(input => input.type = "password");
      return;
    }

    // Check if there's any empty input
    const hasEmpty = inputArray.some(input => !input.value);

    if (hasEmpty) {
      // Focused input is empty:
      // Find the last filled input and show its value.
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
      // All inputs are filled: only show the focused input.
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

      // Update masking behavior after input changes.
      updateInputTypes();
    });

    // Enforce sequential filling for empty inputs.
    // Allow editing of already filled inputs even if there are empty ones.
    input.addEventListener("focus", () => {
      if (!input.value) {
        // Redirect focus to the first empty input if the focused input is empty.
        const firstEmpty = inputArray.find((el) => !el.value);
        if (firstEmpty && firstEmpty !== input) {
          firstEmpty.focus();
        }
      }
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
        updateInputTypes();
      }
    });
  });

  // When focus leaves the confirm-code container, mask all inputs.
  container.addEventListener("focusout", () => {
    // Delay execution to allow the new focused element to be set.
    setTimeout(() => {
      if (!container.contains(document.activeElement)) {
        inputArray.forEach((input) => (input.type = "password"));
      }
    }, 0);
  });
});
