(function () {
    const BASE_STREAM_SETTINGS = {
        latency: { min: 34, max: 46, precision: 0, unit: 'ms' },
        cues: { min: 4, max: 7, precision: 0, suffix: ' active' },
        sports: { min: 3, max: 4, precision: 0, suffix: ' synced' },
        cognitive: { min: 76, max: 90, precision: 0, suffix: '%' },
        confidence: { min: 2.8, max: 6.2, precision: 1, prefix: '+' },
        risk: { min: 0.8, max: 2.2, precision: 1, suffix: '%' }
    };

    const SPORTS = {
        baseball: {
            overlay: {
                athlete: 'Pitcher • SEC',
                status: 'Green channel: ready',
                cue: 'Release high • +3°',
                window: '0.42 s'
            },
            streams: {
                latency: { min: 35, max: 41 },
                cues: { min: 5, max: 7 },
                sports: { min: 3, max: 3 },
                cognitive: { min: 81, max: 88 },
                confidence: { min: 3.6, max: 5.4 },
                risk: { min: 0.8, max: 1.4 }
            },
            chart: {
                labels: ['Release Timing', 'Hip Drive', 'Command', 'Competitive Focus', 'Recovery'],
                data: [92, 95, 90, 94, 88],
                baseline: 0.78,
                sensitivity: 48
            }
        },
        football: {
            overlay: {
                athlete: 'Quarterback • Big 12',
                status: 'Orange channel: edge pressure',
                cue: 'Slide protection left',
                window: '1.10 s'
            },
            streams: {
                latency: { min: 37, max: 44 },
                cues: { min: 4, max: 6 },
                sports: { min: 4, max: 4 },
                cognitive: { min: 78, max: 86 },
                confidence: { min: 2.8, max: 4.9 },
                risk: { min: 1.2, max: 2.0 }
            },
            chart: {
                labels: ['Read Progression', 'Pocket Footwork', 'Release Velocity', 'Coverage Recognition', 'Composure'],
                data: [89, 92, 96, 88, 91],
                baseline: 0.74,
                sensitivity: 55
            }
        },
        basketball: {
            overlay: {
                athlete: 'Wing • NBA Prospect',
                status: 'Blue channel: corner drift',
                cue: 'Lift to slot • catch & shoot',
                window: '0.64 s'
            },
            streams: {
                latency: { min: 33, max: 39 },
                cues: { min: 5, max: 7 },
                sports: { min: 3, max: 4 },
                cognitive: { min: 82, max: 90 },
                confidence: { min: 3.8, max: 6.2 },
                risk: { min: 0.7, max: 1.5 }
            },
            chart: {
                labels: ['Shot Prep', 'Spacing Discipline', 'Defensive Read', 'Explosive First Step', 'Confidence'],
                data: [94, 91, 90, 93, 95],
                baseline: 0.82,
                sensitivity: 42
            }
        }
    };

    const cloneSettings = (settings) => JSON.parse(JSON.stringify(settings));
    let activeStreamSettings = cloneSettings(BASE_STREAM_SETTINGS);
    let currentSport = 'baseball';
    let currentIntensity = SPORTS.baseball.chart.baseline;

    const streamElements = document.querySelectorAll('[data-ar-stream]');

    const formatValue = (value, cfg) => {
        const decimals = cfg.precision ?? 0;
        const rounded = Number(value).toFixed(decimals);
        let output = `${cfg.prefix ?? ''}${rounded}`;
        if (cfg.unit) {
            output += ` ${cfg.unit}`;
        }
        if (cfg.suffix) {
            output += cfg.suffix;
        }
        return output;
    };

    const applyStreamOverrides = (overrides) => {
        activeStreamSettings = cloneSettings(BASE_STREAM_SETTINGS);
        if (!overrides) return;
        Object.keys(overrides).forEach((key) => {
            if (!activeStreamSettings[key]) {
                activeStreamSettings[key] = overrides[key];
            } else {
                activeStreamSettings[key] = { ...activeStreamSettings[key], ...overrides[key] };
            }
        });
    };

    const updateStreams = (useMidpoint = false) => {
        streamElements.forEach((node) => {
            const key = node.dataset.arStream;
            const cfg = activeStreamSettings[key];
            if (!cfg) return;
            const value = useMidpoint ? (cfg.min + cfg.max) / 2 : Math.random() * (cfg.max - cfg.min) + cfg.min;
            node.textContent = formatValue(value, cfg);
        });
    };

    const overlayAthlete = document.querySelector('[data-mode-athlete]');
    const overlayStatus = document.querySelector('[data-mode-status]');
    const overlayCue = document.querySelector('[data-mode-cue]');
    const overlayWindow = document.querySelector('[data-mode-window]');

    const renderOverlay = (overlay) => {
        if (overlayAthlete) overlayAthlete.textContent = overlay.athlete;
        if (overlayStatus) overlayStatus.textContent = overlay.status;
        if (overlayCue) overlayCue.textContent = overlay.cue;
        if (overlayWindow) overlayWindow.textContent = overlay.window;
    };

    const chartEl = document.getElementById('arCorrectionChart');
    const intensityInput = document.getElementById('intensityRange');
    const intensityLabel = document.querySelector('[data-intensity-label]');
    let correctionChart;

    const updateChart = () => {
        if (!correctionChart) return;
        const profile = SPORTS[currentSport];
        const { data, labels, sensitivity, baseline } = profile.chart;
        const multiplier = (currentIntensity - baseline) * sensitivity;
        const scaled = data.map((value) => {
            const adjusted = value + multiplier;
            return Math.max(60, Math.min(100, adjusted));
        });
        correctionChart.config.data.labels = labels;
        correctionChart.config.data.datasets[0].data = scaled;
        correctionChart.update();
    };

    const setSport = (sportKey) => {
        if (!SPORTS[sportKey]) return;
        currentSport = sportKey;
        const profile = SPORTS[sportKey];
        applyStreamOverrides(profile.streams);
        updateStreams(true);
        renderOverlay(profile.overlay);
        currentIntensity = profile.chart.baseline;
        if (intensityInput) intensityInput.value = profile.chart.baseline;
        if (intensityLabel) intensityLabel.textContent = Number(profile.chart.baseline).toFixed(2);
        updateChart();
    };

    if (chartEl) {
        const ctx = chartEl.getContext('2d');
        correctionChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: SPORTS.baseball.chart.labels,
                datasets: [
                    {
                        label: 'Correction Efficiency',
                        data: SPORTS.baseball.chart.data,
                        backgroundColor: 'rgba(255, 107, 44, 0.25)',
                        borderColor: 'rgba(255, 107, 44, 0.9)',
                        borderWidth: 2,
                        pointBackgroundColor: '#ff6b2c',
                        pointBorderColor: '#0f172a'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 60,
                        max: 100,
                        ticks: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.25)'
                        },
                        angleLines: {
                            color: 'rgba(148, 163, 184, 0.25)'
                        },
                        pointLabels: {
                            color: '#cbd5f5',
                            font: {
                                size: 12,
                                family: 'Inter, sans-serif'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    document.querySelectorAll('[data-ar-mode]').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('[data-ar-mode]').forEach((btn) => btn.classList.toggle('is-active', btn === button));
            setSport(button.dataset.arMode);
        });
    });

    if (intensityInput) {
        intensityInput.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            currentIntensity = value;
            if (intensityLabel) intensityLabel.textContent = value.toFixed(2);
            updateChart();
        });
    }

    setSport(currentSport);
    updateStreams(true);
    setInterval(() => updateStreams(false), 3200);
})();
