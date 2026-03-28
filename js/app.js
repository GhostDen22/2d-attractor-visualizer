const sliderMappings = [
  { inputId: "paramA", valueId: "valueA", decimals: 2 },
  { inputId: "paramB", valueId: "valueB", decimals: 2 },
  { inputId: "paramC", valueId: "valueC", decimals: 2 },
  { inputId: "paramD", valueId: "valueD", decimals: 2 },
  { inputId: "fpsControl", valueId: "valueFps", decimals: 0 },
  { inputId: "pointsPerFrame", valueId: "valuePoints", decimals: 0 }
];

const defaults = {
  dejong: {
    a: 1.4,
    b: -2.3,
    c: 2.4,
    d: -2.1
  }
};

const canvas = document.getElementById("attractorCanvas");
const ctx = canvas.getContext("2d");

const attractorMode = document.getElementById("attractorMode");
const canvasModeLabel = document.getElementById("canvasModeLabel");
const appStatus = document.getElementById("appStatus");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const colorButtons = document.querySelectorAll(".color-button");

const paramAInput = document.getElementById("paramA");
const paramBInput = document.getElementById("paramB");
const paramCInput = document.getElementById("paramC");
const paramDInput = document.getElementById("paramD");
const fpsControlInput = document.getElementById("fpsControl");
const pointsPerFrameInput = document.getElementById("pointsPerFrame");

const controlsToLock = [
  attractorMode,
  paramAInput,
  paramBInput,
  paramCInput,
  paramDInput,
  fpsControlInput,
  pointsPerFrameInput,
  startBtn,
  ...colorButtons
];

let selectedColor = "#ff4d4d";
let isRunning = false;
let animationFrameId = null;
let lastFrameTime = 0;

let currentX = 0;
let currentY = 0;
let needsFreshRender = false;

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
      handleSettingsChanged();
    });
  });
}

function updateModeLabel() {
  canvasModeLabel.textContent =
    attractorMode.value === "dejong" ? "Peter de Jong" : "Clifford";
}

function clearCanvas() {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function applyFadeEffect() {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.045)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function resetAttractorState() {
  currentX = 0;
  currentY = 0;
}

function getCurrentParameters() {
  return {
    a: Number(paramAInput.value),
    b: Number(paramBInput.value),
    c: Number(paramCInput.value),
    d: Number(paramDInput.value)
  };
}

function computeDeJongNextPoint(x, y, params) {
  const nextX = Math.sin(params.a * y) - Math.cos(params.b * x);
  const nextY = Math.sin(params.c * x) - Math.cos(params.d * y);

  return { x: nextX, y: nextY };
}

function mapToCanvas(x, y) {
  const scale = Math.min(canvas.width, canvas.height) * 0.18;
  const canvasX = canvas.width / 2 + x * scale;
  const canvasY = canvas.height / 2 - y * scale;

  return { x: canvasX, y: canvasY };
}

function drawSoftPoint(x, y, color) {
  const mapped = mapToCanvas(x, y);

  if (
    mapped.x < 0 ||
    mapped.x > canvas.width ||
    mapped.y < 0 ||
    mapped.y > canvas.height
  ) {
    return;
  }

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.18;
  ctx.shadowBlur = 5;
  ctx.shadowColor = color;

  ctx.beginPath();
  ctx.arc(mapped.x, mapped.y, 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawDeJongBatch() {
  const params = getCurrentParameters();
  const pointsPerFrame = Number(pointsPerFrameInput.value);

  applyFadeEffect();

  for (let i = 0; i < pointsPerFrame; i += 1) {
    const nextPoint = computeDeJongNextPoint(currentX, currentY, params);
    currentX = nextPoint.x;
    currentY = nextPoint.y;

    if (i > 20) {
      drawSoftPoint(currentX, currentY, selectedColor);
    }
  }
}

function animationLoop(timestamp) {
  if (!isRunning) {
    return;
  }

  const fps = Number(fpsControlInput.value);
  const frameInterval = 1000 / fps;

  if (!lastFrameTime || timestamp - lastFrameTime >= frameInterval) {
    if (attractorMode.value === "dejong") {
      drawDeJongBatch();
    }

    lastFrameTime = timestamp;
  }

  animationFrameId = window.requestAnimationFrame(animationLoop);
}

function setControlsLocked(locked) {
  controlsToLock.forEach((element) => {
    element.disabled = locked;
  });

  stopBtn.disabled = !locked;
  resetBtn.disabled = false;
}

function startAnimation() {
  if (isRunning) {
    return;
  }

  if (attractorMode.value !== "dejong") {
    appStatus.textContent = "Clifford mode will be added next";
    return;
  }

  if (needsFreshRender) {
    clearCanvas();
    resetAttractorState();
    needsFreshRender = false;
  }

  isRunning = true;
  lastFrameTime = 0;
  setControlsLocked(true);
  appStatus.textContent = "Running";

  animationFrameId = window.requestAnimationFrame(animationLoop);
}

function stopAnimation() {
  isRunning = false;

  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  setControlsLocked(false);
  appStatus.textContent = "Stopped";
}

function applyDefaultParameters(mode) {
  const selectedDefaults = defaults[mode];

  if (!selectedDefaults) {
    return;
  }

  paramAInput.value = selectedDefaults.a.toFixed(2);
  paramBInput.value = selectedDefaults.b.toFixed(2);
  paramCInput.value = selectedDefaults.c.toFixed(2);
  paramDInput.value = selectedDefaults.d.toFixed(2);

  sliderMappings.forEach(({ inputId, valueId, decimals }) => {
    updateSliderValue(inputId, valueId, decimals);
  });
}

function prepareFreshRender(statusText = "Ready to render") {
  clearCanvas();
  resetAttractorState();
  needsFreshRender = true;
  appStatus.textContent = statusText;
}

function handleSettingsChanged() {
  if (isRunning) {
    return;
  }

  prepareFreshRender("Settings changed");
}

function initializeModeSelect() {
  updateModeLabel();

  attractorMode.addEventListener("change", () => {
    updateModeLabel();

    if (attractorMode.value === "dejong") {
      applyDefaultParameters("dejong");
      prepareFreshRender("Peter de Jong selected");
    } else {
      prepareFreshRender("Clifford mode will be added next");
    }
  });
}

function initializeColorButtons() {
  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      colorButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      selectedColor = button.dataset.color;

      handleSettingsChanged();
    });
  });
}

function initializeControlButtons() {
  startBtn.addEventListener("click", () => {
    startAnimation();
  });

  stopBtn.addEventListener("click", () => {
    stopAnimation();
  });

  resetBtn.addEventListener("click", () => {
    if (isRunning) {
      stopAnimation();
    }

    attractorMode.value = "dejong";
    fpsControlInput.value = "30";
    pointsPerFrameInput.value = "1000";
    selectedColor = "#ff4d4d";

    colorButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.color === selectedColor);
    });

    applyDefaultParameters("dejong");

    sliderMappings.forEach(({ inputId, valueId, decimals }) => {
      updateSliderValue(inputId, valueId, decimals);
    });

    updateModeLabel();
    prepareFreshRender("Reset to default");
    setControlsLocked(false);
  });
}

function initializeCanvas() {
  clearCanvas();
  resetAttractorState();
}

function initializeApp() {
  initializeCanvas();
  initializeSliders();
  initializeModeSelect();
  initializeColorButtons();
  initializeControlButtons();

  applyDefaultParameters("dejong");
  updateModeLabel();

  setControlsLocked(false);
  stopBtn.disabled = true;
  appStatus.textContent = "Ready";
}

initializeApp();