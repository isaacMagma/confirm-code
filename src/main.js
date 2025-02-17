import './style.css'

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".confirm-code__wrapper input");
  const inputArray = Array.from(inputs);

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

      // Ensure that only one digit is stored (safeguard)
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
    });

    // Enforce sequential filling only for empty inputs.
    // Allow editing of already filled inputs even if there are empty ones.
    input.addEventListener("focus", () => {
      // Only redirect if the input is empty.
      if (!input.value) {
        // Find the first empty input from left to right.
        const firstEmpty = inputArray.find((el) => !el.value);
        if (firstEmpty && firstEmpty !== input) {
          firstEmpty.focus();
        }
      }
    });
  });
});
