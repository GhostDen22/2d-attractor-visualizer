window.AppConfig = {
    sliderMappings: [
        { inputId: "paramA", valueId: "valueA", decimals: 2 },
        { inputId: "paramB", valueId: "valueB", decimals: 2 },
        { inputId: "paramC", valueId: "valueC", decimals: 2 },
        { inputId: "paramD", valueId: "valueD", decimals: 2 },
        { inputId: "fpsControl", valueId: "valueFps", decimals: 0 },
        { inputId: "pointsPerFrame", valueId: "valuePoints", decimals: 0 }
    ],

    defaults: {
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
    },

    renderModeDefaults: {
        static: {
            pointsPerFrame: 1000,
            fadeStrength: 0.045
        },
        dynamic: {
            pointsPerFrame: 2000,
            fadeStrength: 0.09
        }
    },

    morphProfiles: {
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
    },

    renderSettings: {
        pointAlpha: 0.18,
        pointShadowBlur: 5,
        pointRadius: 0.9
    }
};