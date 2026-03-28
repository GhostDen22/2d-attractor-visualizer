const sliderMappings = [
  { inputId: "paramA", valueId: "valueA", decimals: 2 },
  { inputId: "paramB", valueId: "valueB", decimals: 2 },
  { inputId: "paramC", valueId: "valueC", decimals: 2 },
  { inputId: "paramD", valueId: "valueD", decimals: 2 },
  { inputId: "fpsControl", valueId: "valueFps", decimals: 0 },
  { inputId: "pointsPerFrame", valueId: "valuePoints", decimals: 0 }
];

const attractorMode = document.getElementById("attractorMode");
const canvasModeLabel = document.getElementById("canvasModeLabel");
const appStatus = document.getElementById("appStatus");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const colorButtons = document.querySelectorAll(".color-button");

function updateSliderValue(inputId, valueId, decimals) {
  const input = document.getElementById(inputId);
  const valueElement = document.getElementById(valueId);

  if (!input || !valueElement) {
    return;
  }

  const value = Number(input.value);
  valueElement.textContent = value.toFixed(decimals);
}

function initializeSliders() {
  sliderMappings.forEach(({ inputId, valueId, decimals }) => {
    const input = document.getElementById(inputId);

    if (!input) {
      return;
    }

    updateSliderValue(inputId, valueId, decimals);

    input.addEventListener("input", () => {
      updateSliderValue(inputId, valueId, decimals);
    });
  });
}

function updateModeLabel() {
  canvasModeLabel.textContent =
    attractorMode.value === "dejong" ? "Peter de Jong" : "Clifford";
}

function initializeModeSelect() {
  updateModeLabel();

  attractorMode.addEventListener("change", () => {
    updateModeLabel();
    appStatus.textContent = "Mode changed";
  });
}

function initializeColorButtons() {
  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      colorButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      appStatus.textContent = `Color selected: ${button.dataset.color}`;
    });
  });
}

function initializeControlButtons() {
  startBtn.addEventListener("click", () => {
    appStatus.textContent = "Running";
  });

  stopBtn.addEventListener("click", () => {
    appStatus.textContent = "Stopped";
  });

  resetBtn.addEventListener("click", () => {
    document.getElementById("paramA").value = "1.40";
    document.getElementById("paramB").value = "-2.30";
    document.getElementById("paramC").value = "2.40";
    document.getElementById("paramD").value = "-2.10";
    document.getElementById("fpsControl").value = "30";
    document.getElementById("pointsPerFrame").value = "1000";
    attractorMode.value = "dejong";

    sliderMappings.forEach(({ inputId, valueId, decimals }) => {
      updateSliderValue(inputId, valueId, decimals);
    });

    updateModeLabel();
    appStatus.textContent = "Reset to default";
  });
}

function initializeApp() {
  initializeSliders();
  initializeModeSelect();
  initializeColorButtons();
  initializeControlButtons();
}

initializeApp();