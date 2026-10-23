// DOM Element References
const sourceLangSelect = document.getElementById('source-lang');
const targetLangSelect = document.getElementById('target-lang');
const sourceText = document.getElementById('source-text');
const targetText = document.getElementById('target-text');
const translateBtn = document.getElementById('translate-btn');
const swapBtn = document.getElementById('swap-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const speakBtn = document.getElementById('speak-btn');
const micBtn = document.getElementById('mic-btn');
const charCount = document.getElementById('char-count');
const loader = document.getElementById('loader');
const statusTag = document.getElementById('status-tag');
const toast = document.getElementById('toast');

// Update character counter
sourceText.addEventListener('input', () => {
  charCount.textContent = `${sourceText.value.length} / 1000`;
});

// Translation API Call using MyMemory Free API
async function performTranslation() {
  const text = sourceText.value.trim();
  if (!text) return;

  const sourceLang = sourceLangSelect.value === 'autodetect' ? 'Autodetect' : sourceLangSelect.value;
  const targetLang = targetLangSelect.value;

  // Show Loading state
  loader.classList.remove('hidden');
  targetText.value = '';
  statusTag.textContent = 'Translating...';

  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.responseData) {
      targetText.value = data.responseData.translatedText;
      statusTag.textContent = 'Done';
    } else {
      targetText.value = 'Error fetching translation. Please try again.';
      statusTag.textContent = 'Error';
    }
  } catch (error) {
    console.error('Translation error:', error);
    targetText.value = 'Failed to connect to translation server.';
    statusTag.textContent = 'Failed';
  } finally {
    loader.classList.add('hidden');
  }
}

// Event Listeners
translateBtn.addEventListener('click', performTranslation);

// Swap Source & Target Languages
swapBtn.addEventListener('click', () => {
  if (sourceLangSelect.value === 'autodetect') return;

  const tempLang = sourceLangSelect.value;
  sourceLangSelect.value = targetLangSelect.value;
  targetLangSelect.value = tempLang;

  const tempText = sourceText.value;
  sourceText.value = targetText.value;
  targetText.value = tempText;

  charCount.textContent = `${sourceText.value.length} / 1000`;
});

// Clear Text
clearBtn.addEventListener('click', () => {
  sourceText.value = '';
  targetText.value = '';
  charCount.textContent = '0 / 1000';
  statusTag.textContent = 'Ready';
});

// Copy Translation to Clipboard
copyBtn.addEventListener('click', () => {
  if (!targetText.value) return;

  navigator.clipboard.writeText(targetText.value).then(() => {
    showToast('Copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy text.');
  });
});

// Text-To-Speech Feature
speakBtn.addEventListener('click', () => {
  const text = targetText.value;
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLangSelect.value;
  window.speechSynthesis.speak(utterance);
});

// Speech Recognition Feature (Speech to Text)
micBtn.addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showToast('Speech recognition is not supported in this browser.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = sourceLangSelect.value === 'autodetect' ? 'en-US' : sourceLangSelect.value;

  recognition.onstart = () => {
    micBtn.style.color = '#e53e3e';
    showToast('Listening...');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sourceText.value = transcript;
    charCount.textContent = `${transcript.length} / 1000`;
    micBtn.style.color = '';
  };

  recognition.onerror = () => {
    micBtn.style.color = '';
    showToast('Error recognizing speech.');
  };

  recognition.onend = () => {
    micBtn.style.color = '';
  };

  recognition.start();
});

// Toast notification display helper
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}
