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
  },
  clifford: {
    a: -1.4,
    b: 1.6,
    c: 2.1,
    d: 0.7
  }
};

const renderModeDefaults = {
  static: {
    pointsPerFrame: 1000,
    fadeStrength: 0.045
  },
  dynamic: {
    pointsPerFrame: 2000,
    fadeStrength: 0.09
  }
};

const morphProfiles = {
  dejong: {
    a: { amplitude: 0.35, speed: 0.75, phase: 0.0 },
    b: { amplitude: 0.30, speed: 0.55, phase: 1.1 },
    c: { amplitude: 0.28, speed: 0.65, phase: 2.0 },
    d: { amplitude: 0.25, speed: 0.45, phase: 2.7 }
  },
  clifford: {
    a: { amplitude: 0.22, speed: 0.70, phase: 0.3 },
    b: { amplitude: 0.18, speed: 0.50, phase: 1.4 },
    c: { amplitude: 0.26, speed: 0.60, phase: 2.2 },
    d: { amplitude: 0.16, speed: 0.42, phase: 2.9 }
  }
};

const canvas = document.getElementById("attractorCanvas");
const ctx = canvas.getContext("2d");

const attractorMode = document.getElementById("attractorMode");
const renderMode = document.getElementById("renderMode");
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

const valueA = document.getElementById("valueA");
const valueB = document.getElementById("valueB");
const valueC = document.getElementById("valueC");
const valueD = document.getElementById("valueD");

const controlsToLock = [
  attractorMode,
  renderMode,
  paramAInput,
  paramBInput,
  paramCInput,
  paramDInput,
  fpsControlInput,
  pointsPerFrameInput,
  startBtn,
  ...colorButtons
];

const renderSettings = {
  pointAlpha: 0.18,
  pointShadowBlur: 5,
  pointRadius: 0.9
};

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

function syncDisplayedValuesWithInputs() {
  sliderMappings.forEach(({ inputId, valueId, decimals }) => {
    updateSliderValue(inputId, valueId, decimals);
  });
}

function setDisplayedParameterValues(params) {
  valueA.textContent = params.a.toFixed(2);
  valueB.textContent = params.b.toFixed(2);
  valueC.textContent = params.c.toFixed(2);
  valueD.textContent = params.d.toFixed(2);
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

function getModeLabel(mode) {
  return mode === "dejong" ? "Peter de Jong" : "Clifford";
}

function getRenderModeLabel(mode) {
  return mode === "dynamic" ? "Dynamic Render" : "Static Render";
}

function updateModeLabel() {
  canvasModeLabel.textContent = getModeLabel(attractorMode.value);
}

function clearCanvas() {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function getCurrentFadeStrength() {
  return renderModeDefaults[renderMode.value].fadeStrength;
}

function applyFadeEffect() {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = `rgba(0, 0, 0, ${getCurrentFadeStrength()})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function applyRenderModeDefaults(mode) {
  const selectedDefaults = renderModeDefaults[mode];

  if (!selectedDefaults) {
    return;
  }

  pointsPerFrameInput.value = String(selectedDefaults.pointsPerFrame);
  updateSliderValue("pointsPerFrame", "valuePoints", 0);
}

function resetAttractorState() {
  currentX = 0;
  currentY = 0;
}

function getCurrentParametersFromInputs() {
  return {
    a: Number(paramAInput.value),
    b: Number(paramBInput.value),
    c: Number(paramCInput.value),
    d: Number(paramDInput.value)
  };
}

function clampParameterValue(input, value) {
  const min = Number(input.min);
  const max = Number(input.max);

  return Math.min(max, Math.max(min, value));
}

function getMorphedParameters(timeSeconds) {
  const mode = attractorMode.value;
  const base = getCurrentParametersFromInputs();
  const profile = morphProfiles[mode];

  return {
    a: clampParameterValue(
      paramAInput,
      base.a + profile.a.amplitude * Math.sin(timeSeconds * profile.a.speed + profile.a.phase)
    ),
    b: clampParameterValue(
      paramBInput,
      base.b + profile.b.amplitude * Math.sin(timeSeconds * profile.b.speed + profile.b.phase)
    ),
    c: clampParameterValue(
      paramCInput,
      base.c + profile.c.amplitude * Math.sin(timeSeconds * profile.c.speed + profile.c.phase)
    ),
    d: clampParameterValue(
      paramDInput,
      base.d + profile.d.amplitude * Math.sin(timeSeconds * profile.d.speed + profile.d.phase)
    )
  };
}

function computeDeJongNextPoint(x, y, params) {
  const nextX = Math.sin(params.a * y) - Math.cos(params.b * x);
  const nextY = Math.sin(params.c * x) - Math.cos(params.d * y);

  return { x: nextX, y: nextY };
}

function computeCliffordNextPoint(x, y, params) {
  const nextX = Math.sin(params.a * y) + params.c * Math.cos(params.a * x);
  const nextY = Math.sin(params.b * x) + params.d * Math.cos(params.b * y);

  return { x: nextX, y: nextY };
}

function computeNextPoint(mode, x, y, params) {
  if (mode === "clifford") {
    return computeCliffordNextPoint(x, y, params);
  }

  return computeDeJongNextPoint(x, y, params);
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
  ctx.globalAlpha = renderSettings.pointAlpha;
  ctx.shadowBlur = renderSettings.pointShadowBlur;
  ctx.shadowColor = color;

  ctx.beginPath();
  ctx.arc(mapped.x, mapped.y, renderSettings.pointRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAttractorBatch(params) {
  const mode = attractorMode.value;
  const pointsPerFrame = Number(pointsPerFrameInput.value);

  applyFadeEffect();

  for (let i = 0; i < pointsPerFrame; i += 1) {
    const nextPoint = computeNextPoint(mode, currentX, currentY, params);
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
    let activeParams;

    if (renderMode.value === "dynamic") {
      activeParams = getMorphedParameters(timestamp / 1000);
      setDisplayedParameterValues(activeParams);
    } else {
      activeParams = getCurrentParametersFromInputs();
      setDisplayedParameterValues(activeParams);
    }

    drawAttractorBatch(activeParams);
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

  if (needsFreshRender) {
    clearCanvas();
    resetAttractorState();
    needsFreshRender = false;
  }

  isRunning = true;
  lastFrameTime = 0;
  setControlsLocked(true);
  appStatus.textContent = `Running ${getModeLabel(attractorMode.value)} · ${getRenderModeLabel(renderMode.value)}`;

  animationFrameId = window.requestAnimationFrame(animationLoop);
}

function stopAnimation() {
  isRunning = false;

  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  setControlsLocked(false);
  syncDisplayedValuesWithInputs();
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

  syncDisplayedValuesWithInputs();
}

function prepareFreshRender(statusText = "Ready to render") {
  clearCanvas();
  resetAttractorState();
  needsFreshRender = true;
  syncDisplayedValuesWithInputs();
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
    const selectedMode = attractorMode.value;
    updateModeLabel();
    applyDefaultParameters(selectedMode);
    prepareFreshRender(`${getModeLabel(selectedMode)} selected`);
  });

  renderMode.addEventListener("change", () => {
    applyRenderModeDefaults(renderMode.value);
    prepareFreshRender(`${getRenderModeLabel(renderMode.value)} selected`);
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

    const currentMode = attractorMode.value;
    const currentRenderMode = renderMode.value;

    fpsControlInput.value = "30";
    selectedColor = "#ff4d4d";

    colorButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.color === selectedColor);
    });

    applyDefaultParameters(currentMode);
    applyRenderModeDefaults(currentRenderMode);
    syncDisplayedValuesWithInputs();
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
  applyRenderModeDefaults("static");
  updateModeLabel();

  setControlsLocked(false);
  stopBtn.disabled = true;
  appStatus.textContent = "Ready";
}

initializeApp();