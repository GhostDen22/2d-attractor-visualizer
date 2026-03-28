window.AppDOM = {
    canvas: document.getElementById("attractorCanvas"),
    ctx: document.getElementById("attractorCanvas").getContext("2d"),

    attractorMode: document.getElementById("attractorMode"),
    renderMode: document.getElementById("renderMode"),
    debugMode: document.getElementById("debugMode"),
    debugModeWrapper: document.getElementById("debugModeWrapper"),
    canvasModeLabel: document.getElementById("canvasModeLabel"),
    appStatus: document.getElementById("appStatus"),

    startBtn: document.getElementById("startBtn"),
    stopBtn: document.getElementById("stopBtn"),
    resetBtn: document.getElementById("resetBtn"),

    colorButtons: document.querySelectorAll(".color-button"),

    paramAInput: document.getElementById("paramA"),
    paramBInput: document.getElementById("paramB"),
    paramCInput: document.getElementById("paramC"),
    paramDInput: document.getElementById("paramD"),
    fpsControlInput: document.getElementById("fpsControl"),
    pointsPerFrameInput: document.getElementById("pointsPerFrame"),

    valueA: document.getElementById("valueA"),
    valueB: document.getElementById("valueB"),
    valueC: document.getElementById("valueC"),
    valueD: document.getElementById("valueD")
};