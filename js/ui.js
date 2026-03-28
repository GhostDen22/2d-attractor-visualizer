window.AppUI = (() => {
  const { sliderMappings, defaults, renderModeDefaults } = window.AppConfig;
  const dom = window.AppDOM;
  const state = window.AppState;

  function isStaticDebugUnlocked() {
    return state.isRunning && dom.renderMode.value === "static" && dom.debugMode.checked;
  }

  function updateDebugModeVisibility() {
    const isStaticMode = dom.renderMode.value === "static";

    dom.debugModeWrapper.style.display = isStaticMode ? "block" : "none";

    if (!isStaticMode) {
      dom.debugMode.checked = false;
    }
  }

  function getAlwaysLockedControls() {
    return [dom.attractorMode, dom.renderMode, dom.startBtn];
  }

  function getDebugUnlockableControls() {
    return [
      dom.paramAInput,
      dom.paramBInput,
      dom.paramCInput,
      dom.paramDInput,
      dom.fpsControlInput,
      dom.pointsPerFrameInput,
      ...dom.colorButtons
    ];
  }

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
    dom.valueA.textContent = params.a.toFixed(2);
    dom.valueB.textContent = params.b.toFixed(2);
    dom.valueC.textContent = params.c.toFixed(2);
    dom.valueD.textContent = params.d.toFixed(2);
  }

  function initializeSliders(onSettingsChanged) {
    sliderMappings.forEach(({ inputId, valueId, decimals }) => {
      const input = document.getElementById(inputId);

      if (!input) {
        return;
      }

      updateSliderValue(inputId, valueId, decimals);

      input.addEventListener("input", () => {
        updateSliderValue(inputId, valueId, decimals);
        onSettingsChanged();
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
    dom.canvasModeLabel.textContent = getModeLabel(dom.attractorMode.value);
  }

  function applyRenderModeDefaults(mode) {
    const selectedDefaults = renderModeDefaults[mode];

    if (!selectedDefaults) {
      return;
    }

    dom.pointsPerFrameInput.value = String(selectedDefaults.pointsPerFrame);
    updateSliderValue("pointsPerFrame", "valuePoints", 0);
  }

  function applyDefaultParameters(mode) {
    const selectedDefaults = defaults[mode];

    if (!selectedDefaults) {
      return;
    }

    dom.paramAInput.value = selectedDefaults.a.toFixed(2);
    dom.paramBInput.value = selectedDefaults.b.toFixed(2);
    dom.paramCInput.value = selectedDefaults.c.toFixed(2);
    dom.paramDInput.value = selectedDefaults.d.toFixed(2);

    syncDisplayedValuesWithInputs();
  }

  function setControlsLocked(locked) {
    const alwaysLockedControls = getAlwaysLockedControls();
    const debugUnlockableControls = getDebugUnlockableControls();
    const unlockDebugControls = locked && isStaticDebugUnlocked();

    alwaysLockedControls.forEach((element) => {
      element.disabled = locked;
    });

    debugUnlockableControls.forEach((element) => {
      element.disabled = locked && !unlockDebugControls;
    });

    dom.debugMode.disabled = locked && !unlockDebugControls;
    dom.stopBtn.disabled = !locked;
    dom.resetBtn.disabled = false;
  }

  return {
    isStaticDebugUnlocked,
    updateDebugModeVisibility,
    updateSliderValue,
    syncDisplayedValuesWithInputs,
    setDisplayedParameterValues,
    initializeSliders,
    getModeLabel,
    getRenderModeLabel,
    updateModeLabel,
    applyRenderModeDefaults,
    applyDefaultParameters,
    setControlsLocked
  };
})();