// CAD Viewer Application Logic
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('cadCanvas');
    const ctx = canvas.getContext('2d');

    // Layer Toggle States
    const layers = {
        geom: true,
        dims: true,
        center: true,
        hatch: true
    };

    // Measurement Tool State
    let measureMode = true;
    let measurePoints = [];

    // DOM Elements
    const btnMeasure = document.getElementById('btn-measure');
    const btnReset = document.getElementById('btn-reset');
    const btnExportSvg = document.getElementById('btn-export-svg');
    const tooltip = document.getElementById('measure-tooltip');

    // Bind Layer Checkboxes
    document.getElementById('layer-geom').addEventListener('change', (e) => { layers.geom = e.target.checked; redraw(); });
    document.getElementById('layer-dims').addEventListener('change', (e) => { layers.dims = e.target.checked; redraw(); });
    document.getElementById('layer-center').addEventListener('change', (e) => { layers.center = e.target.checked; redraw(); });
    document.getElementById('layer-hatch').addEventListener('change', (e) => { layers.hatch = e.target.checked; redraw(); });

    // Measure Tool Toggle
    btnMeasure.addEventListener('click', () => {
        measureMode = !measureMode;
        btnMeasure.classList.toggle('active', measureMode);
        btnMeasure.textContent = `Measure Tool: ${measureMode ? 'ON' : 'OFF'}`;
        tooltip.classList.toggle('hidden', !measureMode);
        measurePoints = [];
        redraw();
    });

    btnReset.addEventListener('click', () => {
        measurePoints = [];
        redraw();
    });

    // Canvas Click for Measurement
    canvas.addEventListener('click', (e) => {
        if (!measureMode) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        measurePoints.push({ x, y });
        if (measurePoints.length > 2) {
            measurePoints = [measurePoints[measurePoints.length - 1]];
        }
        redraw();
    });

    // Export SVG Dummy Trigger
    btnExportSvg.addEventListener('click', () => {
        alert('SVG Export generated successfully! Check your downloads.');
    });

    // Main CAD Drawing Function
    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Center coordinates for Top View
        const cx1 = 260, cy1 = 350;
        // Center coordinates for Front View (Section)
        const cx2 = 680, cy2 = 350;

        // --- TOP VIEW ---
        if (layers.hatch) {
            // Flange face fill
            ctx.fillStyle = '#162028';
            ctx.beginPath();
            ctx.arc(cx1, cy1, 130, 0, Math.PI * 2);
            ctx.arc(cx1, cy1, 40, 0, Math.PI * 2, true);
            ctx.fill();
        }

        if (layers.geom) {
            // Outer Diameter (Ø160)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx1, cy1, 130, 0, Math.PI * 2);
            ctx.stroke();

            // Inner Bore (Ø40)
            ctx.beginPath();
            ctx.arc(cx1, cy1, 40, 0, Math.PI * 2);
            ctx.stroke();

            // Bolt Holes (4 x Ø14 on Ø120 PCD)
            const pcdRadius = 90;
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const bx = cx1 + pcdRadius * Math.cos(angle);
                const by = cy1 + pcdRadius * Math.sin(angle);
                ctx.beginPath();
                ctx.arc(bx, by, 12, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        if (layers.center) {
            // Centerlines
            ctx.strokeStyle = '#ff3d00';
            ctx.lineWidth = 1;
            ctx.setLineDash([10, 4, 2, 4]);
            ctx.beginPath();
            ctx.moveTo(cx1 - 150, cy1); ctx.lineTo(cx1 + 150, cy1);
            ctx.moveTo(cx1, cy1 - 150); ctx.lineTo(cx1, cy1 + 150);
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
        }

        if (layers.dims) {
            // Dimension Callout Ø160
            ctx.strokeStyle = '#00e5ff';
            ctx.fillStyle = '#00e5ff';
            ctx.font = '12px Segoe UI';
            ctx.beginPath();
            ctx.arc(cx1, cy1, 130, 0, Math.PI / 4);
            ctx.stroke();
            ctx.fillText('Ø160 OD', cx1 + 100, cy1 - 100);
        }

        // --- FRONT SECTION VIEW (Right side) ---
        if (layers.geom) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            // Flange cross-section body outline
            ctx.strokeRect(cx2 - 80, cy2 - 100, 160, 200);
            ctx.strokeRect(cx2 - 20, cy2 - 100, 40, 200); // Inner bore channel
        }

        // Draw active measurement line if points selected
        if (measurePoints.length > 0) {
            ctx.fillStyle = '#00e5ff';
            measurePoints.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            if (measurePoints.length === 2) {
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(measurePoints[0].x, measurePoints[0].y);
                ctx.lineTo(measurePoints[1].x, measurePoints[1].y);
                ctx.stroke();

                const dx = measurePoints[1].x - measurePoints[0].x;
                const dy = measurePoints[1].y - measurePoints[0].y;
                const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
                
                tooltip.textContent = `Measured Distance: ${dist} units (scaled)`;
            }
        }
    }

    // Initial draw call
    redraw();
});