import './style.css';

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".confirm-code__wrapper");
  const inputs = Array.from(container.querySelectorAll("input"));
  const MASK_DELAY = 3000; // 3 seconds
  let maskTimer = null;

  // Initialize each input: masked, numeric input mode, and numeric pattern.
  inputs.forEach(input => {
    input.type = "password";
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
  });

  // --- Timer Helpers ---
  const clearMaskTimer = () => {
    if (maskTimer) {
      clearTimeout(maskTimer);
      maskTimer = null;
    }
  };

  const startMaskTimer = () => {
    clearMaskTimer();
    // Only start the timer if an input inside the container is focused.
    if (container.contains(document.activeElement)) {
      maskTimer = setTimeout(() => {
        inputs.forEach(input => (input.type = "password"));
      }, MASK_DELAY);
    }
  };

  const resetMaskTimer = () => {
    startMaskTimer();
  };

  // --- Utility Functions ---
  // Returns the index of the last filled input (or -1 if none)
  const getLastFilledIndex = () =>
    inputs.reduce((lastIndex, input, index) => input.value !== "" ? index : lastIndex, -1);

  // Update masking based on focus and input values:
  // - Focused input always shows its value.
  // - If the focused input is empty, also unmask the last filled input.
  // - If no input is focused, mask all inputs.
  const updateInputTypes = () => {
    const focusedElement = document.activeElement;
    if (!container.contains(focusedElement)) {
      inputs.forEach(input => input.type = "password");
      return;
    }

    // First, mask all inputs.
    inputs.forEach(input => input.type = "password");
    // Always unmask the focused input.
    focusedElement.type = "text";

    // If the focused input is empty, also unmask the last filled input (if different)
    if (focusedElement.value === "") {
      const lastFilledIndex = getLastFilledIndex();
      if (lastFilledIndex !== -1 && inputs[lastFilledIndex] !== focusedElement) {
        inputs[lastFilledIndex].type = "text";
      }
    }
  };

  // --- Event Handlers ---
  const handleKeyDown = (e, input) => {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (allowedKeys.includes(e.key)) {
      resetMaskTimer();
      return;
    }
    // If a digit key is pressed on an already filled input (with no selection), clear it for overwriting.
    if (/^[0-9]$/.test(e.key) && input.value !== "" && input.selectionStart === input.selectionEnd) {
      input.value = "";
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
    resetMaskTimer();
  };

  const handleInput = (input, index) => {
    input.value = input.value.replace(/[^0-9]/g, "").slice(0, 1);

    // Clear subsequent inputs if this input changes.
    for (let i = index + 1; i < inputs.length; i++) {
      inputs[i].value = "";
    }

    // Auto-focus the next empty input, if any.
    if (input.value.length === 1) {
      const nextEmpty = inputs.find((el, idx) => idx > index && !el.value);
      if (nextEmpty) {
        nextEmpty.focus();
      }
    }
    updateInputTypes();
    resetMaskTimer();
  };

  const handleFocus = (input) => {
    // If the focused input is empty, move focus to the first empty input.
    if (!input.value) {
      const firstEmpty = inputs.find(el => !el.value);
      if (firstEmpty && firstEmpty !== input) {
        firstEmpty.focus();
      }
    }
    updateInputTypes();
    resetMaskTimer();
  };

  const handleKeyUp = (e, input, index) => {
    if (["Backspace", "Delete"].includes(e.key) && input.value === "") {
      // Move focus to the last filled input if available.
      for (let i = index - 1; i >= 0; i--) {
        if (inputs[i].value !== "") {
          inputs[i].focus();
          break;
        }
      }
    }
    updateInputTypes();
    resetMaskTimer();
  };

  inputs.forEach((input, index) => {
    input.addEventListener("keydown", e => handleKeyDown(e, input));
    input.addEventListener("input", () => handleInput(input, index));
    input.addEventListener("focus", () => handleFocus(input));
    input.addEventListener("keyup", e => handleKeyUp(e, input, index));
  });

  // When focus leaves the container, mask all inputs and clear the timer.
  container.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!container.contains(document.activeElement)) {
        inputs.forEach(input => (input.type = "password"));
        clearMaskTimer();
      }
    }, 0);
  });
});
