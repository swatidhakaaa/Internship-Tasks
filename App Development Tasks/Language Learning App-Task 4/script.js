// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

// Flashcard Flip
function flipCard() {
  document.getElementById('flashcard').classList.toggle('flipped');
}

function stopPropagation(e) {
  e.stopPropagation();
}

// Text-to-Speech Pronunciation
function speakText(text, lang = 'es') {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Speech Synthesis is not supported in this browser.");
  }
}

function speakCurrentWord(event) {
  event.stopPropagation();
  const word = document.getElementById('cardWord').innerText;
  const lang = document.getElementById('langSelect').value;
  speakText(word, lang);
}

// Quiz Check
function checkAnswer(btn, isCorrect) {
  const options = document.querySelectorAll('.option-btn');
  options.forEach(opt => opt.disabled = true);

  if (isCorrect) {
    btn.classList.add('correct');
    let score = parseInt(document.getElementById('scoreVal').innerText);
    document.getElementById('scoreVal').innerText = score + 10;
  } else {
    btn.classList.add('wrong');
  }

  document.getElementById('nextQuizBtn').style.display = 'inline-block';
}

function nextQuizQuestion() {
  alert("Great practice! Next question loading...");
}

function changeLanguage() {
  console.log("Language switched to: " + document.getElementById('langSelect').value);
}

function startCategory(cat) {
  switchTab('flashcards');
}