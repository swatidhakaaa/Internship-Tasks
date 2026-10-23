// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  buildPianoRoll();
});

// UI Control Listeners
const bpmInput = document.getElementById('bpm-input');
const bpmVal = document.getElementById('bpm-val');
const tempInput = document.getElementById('temp-input');
const tempVal = document.getElementById('temp-val');

bpmInput.addEventListener('input', (e) => bpmVal.textContent = e.target.value);
tempInput.addEventListener('input', (e) => tempVal.textContent = e.target.value);

// Piano Roll Data and Setup
const rows = 8;
const cols = 16;
let generatedNotes = [];

// Frequencies for C4 -> C5 scale
const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

function buildPianoRoll() {
  const rollContainer = document.getElementById('piano-roll');
  rollContainer.innerHTML = '';
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('roll-cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      rollContainer.appendChild(cell);
    }
  }
}

// Interactive Music Synthesis Engine
document.getElementById('generate-btn').addEventListener('click', () => {
  const statusBadge = document.getElementById('status-badge');
  statusBadge.textContent = "Status: Generating Pattern...";
  statusBadge.style.color = "var(--accent-blue)";

  // Clear previous pattern
  document.querySelectorAll('.roll-cell').forEach(cell => {
    cell.classList.remove('active', 'playing');
  });

  generatedNotes = [];
  
  // Simulate Model Inference Output
  for (let c = 0; c < cols; c++) {
    // Generate pseudo-random pattern based on pitch probability
    const activeRow = Math.floor(Math.random() * rows);
    generatedNotes.push(activeRow);

    const cell = document.querySelector(`.roll-cell[data-row="${activeRow}"][data-col="${c}"]`);
    if (cell) cell.classList.add('active');
  }

  setTimeout(() => {
    statusBadge.textContent = "Status: Pattern Ready";
    document.getElementById('play-btn').disabled = false;
  }, 300);
});

// Web Audio API Synthesis Engine
document.getElementById('play-btn').addEventListener('click', async () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const bpm = parseInt(bpmInput.value);
  const stepDuration = (60 / bpm) / 2; // 16th notes
  const statusBadge = document.getElementById('status-badge');

  statusBadge.textContent = "Status: Playing Audio...";
  statusBadge.style.color = "var(--accent-green)";

  for (let col = 0; col < cols; col++) {
    const row = generatedNotes[col];
    
    // Highlight UI playback
    const activeCell = document.querySelector(`.roll-cell[data-row="${row}"][data-col="${col}"]`);
    if (activeCell) activeCell.classList.add('playing');

    // Trigger Synth Tone
    if (row !== undefined) {
      playSynthTone(audioCtx, frequencies[7 - row], stepDuration);
    }

    await new Promise(res => setTimeout(res, stepDuration * 1000));

    if (activeCell) activeCell.classList.remove('playing');
  }

  statusBadge.textContent = "Status: Ready";
  statusBadge.style.color = "var(--accent-blue)";
});

function playSynthTone(ctx, freq, duration) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Tab Switcher Functionality
function openTab(evt, tabName) {
  const tabContents = document.getElementsByClassName