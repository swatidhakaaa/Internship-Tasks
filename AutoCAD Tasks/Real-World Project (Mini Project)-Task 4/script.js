document.addEventListener('DOMContentLoaded', () => {

  // --- TAB SWITCHING NAVIGATION ---
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');

      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');

      // Redraw canvas when blueprint tab opens
      if (target === 'blueprint-section') {
        drawBlueprint();
      }
    });
  });

  // --- CANVAS BLUEPRINT DRAWING ENGINE ---
  const canvas = document.getElementById('blueprintCanvas');
  const ctx = canvas.getContext('2d');

  // Layer Checkboxes
  const chkWalls = document.getElementById('toggle-walls');
  const chkDoors = document.getElementById('toggle-doors');
  const chkDims = document.getElementById('toggle-dims');
  const btnReset = document.getElementById('reset-canvas');

  // Event Listeners for Layer Toggles
  chkWalls.addEventListener('change', drawBlueprint);
  chkDoors.addEventListener('change', drawBlueprint);
  chkDims.addEventListener('change', drawBlueprint);

  btnReset.addEventListener('click', () => {
    chkWalls.checked = true;
    chkDoors.checked = true;
    chkDims.checked = true;
    drawBlueprint();
  });

  function drawBlueprint() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Background
    drawGrid();

    // Draw Plot Boundary (30ft x 40ft relative ratio)
    const startX = 150;
    const startY = 80;
    const width = 500;
    const height = 440;

    // 1. DRAW WALLS (Cyan/White)
    if (chkWalls.checked) {
      ctx.strokeStyle = '#00ffff'; // AutoCAD Cyan Layer
      ctx.lineWidth = 4;

      // Outer Boundary Wall
      ctx.strokeRect(startX, startY, width, height);

      // Inner Room Partitions
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Bedroom 1 Partition Line
      ctx.moveTo(startX + 250, startY);
      ctx.lineTo(startX + 250, startY + 220);

      // Living Room Horizontal Partition
      ctx.moveTo(startX, startY + 220);
      ctx.lineTo(startX + width, startY + 220);

      // Toilet & Kitchen Partition
      ctx.moveTo(startX + 180, startY + 220);
      ctx.lineTo(startX + 180, startY + height);

      ctx.moveTo(startX + 340, startY + 220);
      ctx.lineTo(startX + 340, startY + height);

      ctx.stroke();
    }

    // 2. DRAW DOORS & WINDOWS (Yellow/Green)
    if (chkDoors.checked) {
      ctx.strokeStyle = '#ffff00'; // AutoCAD Yellow Layer
      ctx.lineWidth = 2;

      // Main Entrance Door Arc
      drawDoorArc(startX + 20, startY + height, 40, Math.PI, 1.5 * Math.PI);

      // Bedroom Door
      drawDoorArc(startX + 210, startY + 220, 30, 0, 0.5 * Math.PI);

      // Windows (Green Line Sets)
      ctx.strokeStyle = '#00ff00';
      // Front Window
      ctx.strokeRect(startX + 80, startY - 4, 60, 4);
      // Bedroom Window
      ctx.strokeRect(startX + 320, startY - 4, 60, 4);
    }

    // 3. DRAW DIMENSIONS & TEXT LABELS (Red/White)
    if (chkDims.checked) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Segoe UI, sans-serif';

      // Room Labels
      ctx.fillText('BEDROOM 1', startX + 70, startY + 110);
      ctx.fillText('12\'0" x 11\'0"', startX + 70, startY + 130);

      ctx.fillText('BEDROOM 2', startX + 310, startY + 110);
      ctx.fillText('12\'0" x 11\'0"', startX + 310, startY + 130);

      ctx.fillText('LIVING ROOM', startX + 40, startY + 320);
      ctx.fillText('TOILET', startX + 210, startY + 320);
      ctx.fillText('KITCHEN', startX + 370, startY + 320);

      // Dimension Lines (Red)
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 1;
      
      // Top Dimension Line
      drawDimensionLine(startX, startY - 30, startX + width, startY - 30, '30\' - 0"');
      // Side Dimension Line
      drawDimensionLine(startX - 30, startY, startX - 30, startY + height, '40\' - 0"');
    }
  }

  // Helper Function: Draw AutoCAD Grid Background
  function drawGrid() {
    ctx.strokeStyle = '#112233';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  // Helper Function: Draw Swing Door Arc
  function drawDoorArc(x, y, radius, startAngle, endAngle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // Helper Function: Draw Dimension Line with Text
  function drawDimensionLine(x1, y1, x2, y2, text) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#ffaaaa';
    ctx.font = '11px sans-serif';
    ctx.fillText(text, (x1 + x2) / 2 - 15, (y1 + y2) / 2 - 5);
  }

  // Initial Draw Call
  drawBlueprint();
});