(function () {
    const formatValue = (value, precision, unit) => {
        const fixed = precision !== undefined ? value.toFixed(precision) : value;
        return unit ? `${fixed} ${unit}` : `${fixed}`;
    };

    const STREAM_CONFIG = {
        latency: { min: 36, max: 48, unit: 'ms', precision: 0 },
        stability: { min: 91, max: 97, precision: 0 },
        grf: { min: 2.9, max: 3.6, unit: 'kN', precision: 1 },
        pelvis: { min: 34, max: 41, unit: '°', precision: 0 }
    };

    const STREAM_LAST_VALUES = {};

    const updateStreamNodes = () => {
        document.querySelectorAll('[data-stream]').forEach((node) => {
            const { stream, unit, precision } = node.dataset;
            if (!stream) return;
            const cfg = STREAM_CONFIG[stream] || {};
            const decimals = precision ? parseInt(precision, 10) : cfg.precision ?? 0;
            const min = cfg.min ?? 0;
            const max = cfg.max ?? min + 1;
            const value = Math.random() * (max - min) + min;
            STREAM_LAST_VALUES[stream] = value;
            node.textContent = formatValue(value, decimals, unit || cfg.unit);
        });

        const status = document.querySelector('[data-stream-status]');
        if (status) {
            const current = STREAM_LAST_VALUES.grf ?? 3.2;
            if (current > 3.4) {
                status.textContent = 'Load watch';
                status.classList.add('telemetry-pill--warning');
            } else {
                status.textContent = 'Monitor';
                status.classList.remove('telemetry-pill--warning');
            }
        }
    };

    const updateTelemetry = () => {
        document.querySelectorAll('[data-telemetry]').forEach((node) => {
            const min = parseFloat(node.dataset.min);
            const max = parseFloat(node.dataset.max);
            if (Number.isNaN(min) || Number.isNaN(max)) return;
            const precision = node.dataset.precision ? parseInt(node.dataset.precision, 10) : 0;
            const unit = node.dataset.unit || '';
            const value = Math.random() * (max - min) + min;
            node.textContent = formatValue(value, precision, unit);
        });
    };

    const heroInsightNode = document.querySelector('[data-hero-insight]');
    const HERO_INSIGHTS = [
        'Hip-shoulder separation peaked at 36° — right in the elite delivery window.',
        'Arm slot is reproducing within ±1.4° of the pro bullpen baseline.',
        'Force production leads with the posterior chain — 19% above last week.',
        'Tempo stays synced to the 1.28s pro benchmark while maintaining balance.',
        'Lead leg bracing generates elite vertical force with zero valgus collapse.'
    ];

    const rotateHeroInsight = () => {
        if (!heroInsightNode) return;
        const message = HERO_INSIGHTS[Math.floor(Math.random() * HERO_INSIGHTS.length)];
        heroInsightNode.textContent = message;
    };

    const poseTabs = document.querySelectorAll('.pose-tab');
    const poseTitle = document.querySelector('[data-pose-title]');
    const poseDescription = document.querySelector('[data-pose-description]');

    const POSE_DATA = {
        pitching: {
            title: 'Championship pitching blueprint',
            bullets: [
                'Stride length locked at 92% of athlete height, maximizing downhill leverage.',
                'Trail hip internally rotates on time, preventing early pelvic drift.',
                'Lead leg brace generates +21% more vertical force than NCAA average.'
            ],
            insight: 'Pitching sequence stays inside elite kinematic bands through ball release.'
        },
        hitting: {
            title: 'Premier swing sequencing',
            bullets: [
                'Rear hip coil stores energy without collapsing the front shoulder.',
                'Barrel enters the zone on plane for 17° of optimal contact coverage.',
                'Kinetic chain unloads in under 145 ms to maximize on-plane efficiency.'
            ],
            insight: 'Swing maintains +12% barrel accuracy gain versus last series.'
        },
        speed: {
            title: 'Acceleration mechanics dialed in',
            bullets: [
                'Projection angle holds at 41° through steps two and three.',
                'Ankles recycle under the hip with no backside leakage.',
                'Front-side arm action drives vertical force for explosive turnover.'
            ],
            insight: 'Acceleration window mirrors elite combine splits with smooth force rise.'
        },
        recovery: {
            title: 'Return-to-play safeguards',
            bullets: [
                'Pelvic rotation capped at 85% of load target during reintegration.',
                'Asymmetry index down to 3.4% with progressive stress layering.',
                'Neuromuscular readiness stabilized with consistent HRV improvements.'
            ],
            insight: 'Recovery profile cleared for competitive ramp with zero red flags.'
        }
    };

    const renderPose = (id) => {
        const profile = POSE_DATA[id];
        if (!profile || !poseTitle || !poseDescription) return;
        poseTitle.textContent = profile.title;
        poseDescription.innerHTML = '';
        profile.bullets.forEach((text) => {
            const span = document.createElement('span');
            span.textContent = text;
            poseDescription.appendChild(span);
        });
        if (heroInsightNode) {
            heroInsightNode.textContent = profile.insight;
        }
    };

    poseTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            poseTabs.forEach((btn) => {
                btn.classList.toggle('is-active', btn === tab);
                btn.setAttribute('aria-selected', btn === tab ? 'true' : 'false');
            });
            renderPose(tab.dataset.pose);
        });
    });

    const chartEl = document.getElementById('biomechanicsChart');
    let radarChart;
    const PROFILE_DATA = {
        pitcher: {
            labels: ['Hip Torque', 'Arm Slot Repeatability', 'Tempo', 'Energy Return', 'Command Index'],
            data: [94, 92, 89, 97, 91],
            confidence: '97%',
            energy: '2.3%',
            intelligence: 98
        },
        hitter: {
            labels: ['Bat Speed', 'Attack Angle', 'Sequencing', 'Contact Window', 'Power Transfer'],
            data: [96, 88, 93, 90, 95],
            confidence: '94%',
            energy: '3.8%',
            intelligence: 96
        },
        sprinter: {
            labels: ['Drive Phase', 'Stride Frequency', 'Force Symmetry', 'Ground Contact', 'Recovery Efficiency'],
            data: [92, 95, 91, 88, 94],
            confidence: '98%',
            energy: '1.6%',
            intelligence: 99
        }
    };

    const confidenceNode = document.querySelector('[data-confidence]');
    const energyNode = document.querySelector('[data-energy]');
    const intelligenceNode = document.querySelector('[data-intelligence-score]');

    const renderProfile = (key) => {
        const profile = PROFILE_DATA[key];
        if (!profile || !radarChart) return;
        radarChart.config.data.labels = profile.labels;
        radarChart.config.data.datasets[0].data = profile.data;
        radarChart.update();
        if (confidenceNode) confidenceNode.textContent = profile.confidence;
        if (energyNode) energyNode.textContent = profile.energy;
        if (intelligenceNode) intelligenceNode.textContent = profile.intelligence;
    };

    if (chartEl) {
        const ctx = chartEl.getContext('2d');
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: PROFILE_DATA.pitcher.labels,
                datasets: [
                    {
                        label: 'Performance Index',
                        data: PROFILE_DATA.pitcher.data,
                        backgroundColor: 'rgba(96, 165, 250, 0.25)',
                        borderColor: 'rgba(96, 165, 250, 0.9)',
                        borderWidth: 2,
                        pointBackgroundColor: '#60a5fa',
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

    document.querySelectorAll('[data-profile]').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('[data-profile]').forEach((btn) => btn.classList.toggle('is-active', btn === button));
            renderProfile(button.dataset.profile);
        });
    });

    if (poseTabs.length) {
        renderPose(poseTabs[0].dataset.pose);
    }

    rotateHeroInsight();
    setInterval(rotateHeroInsight, 6500);
    updateStreamNodes();
    updateTelemetry();
    setInterval(() => {
        updateStreamNodes();
        updateTelemetry();
    }, 3200);
})();
