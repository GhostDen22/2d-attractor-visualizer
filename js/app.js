(() => {
  const dom = window.AppDOM;
  const state = window.AppState;
  const ui = window.AppUI;
  const attractors = window.AppAttractors;
  const renderer = window.AppRenderer;

  function prepareFreshRender(statusText = "Ready to render") {
    renderer.clearCanvas();
    renderer.resetAttractorState();
    state.needsFreshRender = true;
    ui.syncDisplayedValuesWithInputs();
    dom.appStatus.textContent = statusText;
  }

  function handleSettingsChanged() {
    if (state.isRunning && !ui.isStaticDebugUnlocked()) {
      return;
    }

    if (state.isRunning && ui.isStaticDebugUnlocked()) {
      renderer.clearCanvas();
      renderer.resetAttractorState();
      state.needsFreshRender = false;
      dom.appStatus.textContent = "Debug update applied";
      return;
    }

    prepareFreshRender("Settings changed");
  }

  function animationLoop(timestamp) {
    if (!state.isRunning) {
      return;
    }

    const fps = Number(dom.fpsControlInput.value);
    const frameInterval = 1000 / fps;

    if (!state.lastFrameTime || timestamp - state.lastFrameTime >= frameInterval) {
      let activeParams;

      if (dom.renderMode.value === "dynamic") {
        activeParams = attractors.getMorphedParameters(timestamp / 1000);
        ui.setDisplayedParameterValues(activeParams);
      } else {
        activeParams = attractors.getCurrentParametersFromInputs();
        ui.setDisplayedParameterValues(activeParams);
      }

      renderer.drawAttractorBatch(activeParams);
      state.lastFrameTime = timestamp;
    }

    state.animationFrameId = window.requestAnimationFrame(animationLoop);
  }

  function startAnimation() {
    if (state.isRunning) {
      return;
    }

    if (state.needsFreshRender) {
      renderer.clearCanvas();
      renderer.resetAttractorState();
      state.needsFreshRender = false;
    }

    state.isRunning = true;
    state.lastFrameTime = 0;
    ui.setControlsLocked(true);
    dom.appStatus.textContent =
      `Running ${ui.getModeLabel(dom.attractorMode.value)} · ${ui.getRenderModeLabel(dom.renderMode.value)}`;

    state.animationFrameId = window.requestAnimationFrame(animationLoop);
  }

  function stopAnimation() {
    state.isRunning = false;

    if (state.animationFrameId) {
      window.cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = null;
    }

    ui.setControlsLocked(false);
    ui.syncDisplayedValuesWithInputs();
    dom.appStatus.textContent = "Stopped";
  }

  function initializeModeSelect() {
    ui.updateModeLabel();
    ui.updateDebugModeVisibility();

    dom.attractorMode.addEventListener("change", () => {
      const selectedMode = dom.attractorMode.value;
      ui.updateModeLabel();
      ui.applyDefaultParameters(selectedMode);
      prepareFreshRender(`${ui.getModeLabel(selectedMode)} selected`);
    });

    dom.renderMode.addEventListener("change", () => {
      ui.applyRenderModeDefaults(dom.renderMode.value);
      ui.updateDebugModeVisibility();
      ui.setControlsLocked(state.isRunning);
      prepareFreshRender(`${ui.getRenderModeLabel(dom.renderMode.value)} selected`);
    });

    dom.debugMode.addEventListener("change", () => {
      ui.setControlsLocked(state.isRunning);
      dom.appStatus.textContent = dom.debugMode.checked
        ? "Debug mode enabled"
        : "Debug mode disabled";
    });
  }

  function initializeColorButtons() {
    dom.colorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        dom.colorButtons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        state.selectedColor = button.dataset.color;

        handleSettingsChanged();
      });
    });
  }

  function initializeControlButtons() {
    dom.startBtn.addEventListener("click", () => {
      startAnimation();
    });

    dom.stopBtn.addEventListener("click", () => {
      stopAnimation();
    });

    dom.resetBtn.addEventListener("click", () => {
      if (state.isRunning) {
        stopAnimation();
      }

      const currentMode = dom.attractorMode.value;
      const currentRenderMode = dom.renderMode.value;

      dom.fpsControlInput.value = "30";
      state.selectedColor = "#ff4d4d";

      dom.colorButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.color === state.selectedColor);
      });

      ui.applyDefaultParameters(currentMode);
      ui.applyRenderModeDefaults(currentRenderMode);
      ui.updateDebugModeVisibility();
      ui.syncDisplayedValuesWithInputs();
      ui.updateModeLabel();
      prepareFreshRender("Reset to default");
      ui.setControlsLocked(false);
    });
  }

  function initializeCanvas() {
    renderer.clearCanvas();
    renderer.resetAttractorState();
  }

  function initializeApp() {
    initializeCanvas();
    ui.initializeSliders(handleSettingsChanged);
    initializeModeSelect();
    initializeColorButtons();
    initializeControlButtons();

    ui.applyDefaultParameters("dejong");
    ui.applyRenderModeDefaults("static");
    ui.updateModeLabel();
    ui.updateDebugModeVisibility();

    ui.setControlsLocked(false);
    dom.stopBtn.disabled = true;
    dom.appStatus.textContent = "Ready";
  }

  initializeApp();
})();