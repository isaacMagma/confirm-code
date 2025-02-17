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
      // Allow only single digits (0-9)
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("input", () => {
      // remove any non-digit characters
      input.value = input.value.replace(/[^0-9]/g, "");

      // only one digit is stored
      if (input.value.length > 1) {
        input.value = input.value.slice(0, 1);
      }

      // If this input is now filled, focus the next empty input (if any)
      if (input.value.length === 1) {
        const nextEmpty = inputArray.find((el, idx) => idx > index && !el.value);
        if (nextEmpty) {
          nextEmpty.focus();
        }
      }
    });

    // Enforce sequential filling:
    input.addEventListener("focus", () => {
      const firstEmpty = inputArray.find((el) => !el.value);
      if (firstEmpty && firstEmpty !== input) {
        firstEmpty.focus();
      }
    });
  });
});


