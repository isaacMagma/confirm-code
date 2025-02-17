import './style.css'

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".confirm-code__wrapper input");

  inputs.forEach((input) => {
    input.setAttribute("inputmode", "numeric"); // helps mobile keyboards
    input.setAttribute("pattern", "[0-9]*"); // hints for validation

    // Prevent entering invalid keys
    input.addEventListener("keydown", (e) => {
      if (
        ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
          e.key
        )
      ) {
        return;
      }

      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    // Clean up the input on each change
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");

      if (input.value.length > 1) {
        input.value = input.value.slice(0, 1);
      }
    });
  });
});

