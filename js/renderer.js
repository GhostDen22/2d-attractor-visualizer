window.AppRenderer = (() => {
    const dom = window.AppDOM;
    const state = window.AppState;
    const { renderSettings, renderModeDefaults } = window.AppConfig;
    const attractors = window.AppAttractors;

    function clearCanvas() {
        dom.ctx.save();
        dom.ctx.globalAlpha = 1;
        dom.ctx.fillStyle = "#000000";
        dom.ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
        dom.ctx.restore();
    }

    function getCurrentFadeStrength() {
        return renderModeDefaults[dom.renderMode.value].fadeStrength;
    }

    function applyFadeEffect() {
        dom.ctx.save();
        dom.ctx.globalAlpha = 1;
        dom.ctx.fillStyle = `rgba(0, 0, 0, ${getCurrentFadeStrength()})`;
        dom.ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
        dom.ctx.restore();
    }

    function resetAttractorState() {
        state.currentX = 0;
        state.currentY = 0;
    }

    function mapToCanvas(x, y) {
        const scale = Math.min(dom.canvas.width, dom.canvas.height) * 0.18;
        const canvasX = dom.canvas.width / 2 + x * scale;
        const canvasY = dom.canvas.height / 2 - y * scale;

        return { x: canvasX, y: canvasY };
    }

    function drawSoftPoint(x, y, color) {
        const mapped = mapToCanvas(x, y);

        if (
            mapped.x < 0 ||
            mapped.x > dom.canvas.width ||
            mapped.y < 0 ||
            mapped.y > dom.canvas.height
        ) {
            return;
        }

        dom.ctx.save();
        dom.ctx.fillStyle = color;
        dom.ctx.globalAlpha = renderSettings.pointAlpha;
        dom.ctx.shadowBlur = renderSettings.pointShadowBlur;
        dom.ctx.shadowColor = color;

        dom.ctx.beginPath();
        dom.ctx.arc(mapped.x, mapped.y, renderSettings.pointRadius, 0, Math.PI * 2);
        dom.ctx.fill();

        dom.ctx.restore();
    }

    function drawAttractorBatch(params) {
        const mode = dom.attractorMode.value;
        const pointsPerFrame = Number(dom.pointsPerFrameInput.value);

        applyFadeEffect();

        for (let i = 0; i < pointsPerFrame; i += 1) {
            const nextPoint = attractors.computeNextPoint(mode, state.currentX, state.currentY, params);
            state.currentX = nextPoint.x;
            state.currentY = nextPoint.y;

            if (i > 20) {
                drawSoftPoint(state.currentX, state.currentY, state.selectedColor);
            }
        }
    }

    return {
        clearCanvas,
        resetAttractorState,
        drawAttractorBatch
    };
})();