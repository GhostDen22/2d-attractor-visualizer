window.AppAttractors = (() => {
    const dom = window.AppDOM;
    const { morphProfiles } = window.AppConfig;

    function getCurrentParametersFromInputs() {
        return {
            a: Number(dom.paramAInput.value),
            b: Number(dom.paramBInput.value),
            c: Number(dom.paramCInput.value),
            d: Number(dom.paramDInput.value)
        };
    }

    function clampParameterValue(input, value) {
        const min = Number(input.min);
        const max = Number(input.max);

        return Math.min(max, Math.max(min, value));
    }

    function getMorphedParameters(timeSeconds) {
        const mode = dom.attractorMode.value;
        const base = getCurrentParametersFromInputs();
        const profile = morphProfiles[mode];

        return {
            a: clampParameterValue(
                dom.paramAInput,
                base.a + profile.a.amplitude * Math.sin(timeSeconds * profile.a.speed + profile.a.phase)
            ),
            b: clampParameterValue(
                dom.paramBInput,
                base.b + profile.b.amplitude * Math.sin(timeSeconds * profile.b.speed + profile.b.phase)
            ),
            c: clampParameterValue(
                dom.paramCInput,
                base.c + profile.c.amplitude * Math.sin(timeSeconds * profile.c.speed + profile.c.phase)
            ),
            d: clampParameterValue(
                dom.paramDInput,
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

    return {
        getCurrentParametersFromInputs,
        getMorphedParameters,
        computeNextPoint
    };
})();