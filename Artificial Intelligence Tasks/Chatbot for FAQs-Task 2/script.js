/**
 * Smart FAQ Chatbot Engine
 * - Pure Client-side Natural Language Processing (Tokenizer, Stemmer, TF-IDF Vectorizer)
 * - Cosine Similarity Metric for Matching
 */

// ==========================================================================
// 1. FAQ Datasets (Pre-loaded Topics)
// ==========================================================================
const FAQ_DATABASE = {
  ecommerce: [
    { id: 'e1', question: 'What is your return policy?', answer: 'You can return any item within 30 days of purchase for a full refund or exchange. Items must be unworn and in original packaging.' },
    { id: 'e2', question: 'How long does shipping take?', answer: 'Standard domestic shipping takes 3-5 business days. Express shipping options (1-2 days) are available at checkout.' },
    { id: 'e3', question: 'How do I track my order?', answer: 'Once your order ships, we will email you a tracking number along with a direct link to check real-time updates.' },
    { id: 'e4', question: 'Which payment methods do you accept?', answer: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay.' },
    { id: 'e5', question: 'Can I change or cancel my order?', answer: 'Orders can be modified or canceled within 1 hour of placement. Please contact customer support immediately.' }
  ],
  saas: [
    { id: 's1', question: 'How do I reset my account password?', answer: 'Click on "Forgot Password" on the login page. Enter your registered email address to receive a password reset link.' },
    { id: 's2', question: 'What are the system API rate limits?', answer: 'Standard plans allow up to 1,000 requests per minute. Enterprise plans support customized higher thresholds.' },
    { id: 's3', question: 'Do you offer a free trial?', answer: 'Yes! We offer a 14-day free trial with full access to premium features without requiring a credit card.' },
    { id: 's4', question: 'How can I upgrade or downgrade my subscription?', answer: 'Navigate to Billing Settings in your account dashboard and select "Change Plan" to update your tier instantly.' }
  ],
  university: [
    { id: 'u1', question: 'What are the undergraduate admission requirements?', answer: 'Applicants must submit high school transcripts, two letters of recommendation, and proof of English proficiency.' },
    { id: 'u2', question: 'When is the application deadline for Fall semester?', answer: 'Early decision applications close on November 1st, while regular decision applications close on January 15th.' },
    { id: 'u3', question: 'Are financial aid and scholarships available?', answer: 'Yes, we offer both merit-based scholarships and need-based financial assistance. Submit the FAFSA form by March 1st.' },
    { id: 'u4', question: 'How do I schedule a campus tour?', answer: 'You can book an in-person campus tour or take a virtual 360-degree tour on our official admissions portal.' }
  ]
};

// ==========================================================================
// 2. Light Natural Language Processing (NLP) Tools
// ==========================================================================

// Stop Words List (common English words to filter out)
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
  "cannot", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further",
  "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
  "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "no", "nor",
  "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
  "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs",
  "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
  "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
  "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
]);

// Basic Porter Stemmer Algorithm (Suffix stripping)
function stemWord(word) {
  if (word.length < 3) return word;
  return word
    .replace(/(ing|edly|es|ed|er|ly|s)$/i, '')
    .replace(/(ation|tion)$/i, 'te');
}

/**
 * Tokenizes text, removes punctuation/numbers, strips stop-words, and stems words.
 */
function preprocessText(text) {
  if (!text) return [];
  
  // Clean special characters and lower-case
  const cleaned = text.toLowerCase().replace(/[^a-z\s]/g, '');
  
  // Tokenize by whitespace
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  
  // Filter stop-words and apply stemming
  const tokens = rawTokens.filter(token => !STOP_WORDS.has(token));
  const stemmedTokens = tokens.map(stemWord);

  return {
    rawTokens,
    tokens,
    stemmedTokens
  };
}

// ==========================================================================
// 3. TF-IDF & Cosine Similarity Engine
// ==========================================================================

class TFIDFSimilarityEngine {
  constructor(documents) {
    this.documents = documents; // Array of FAQ objects [{ id, question, answer }]
    this.vocabulary = [];
    this.docVectors = [];
    this.idfVector = {};
    
    this.buildModel();
  }

  buildModel() {
    // Step 1: Preprocess all document questions
    const processedDocs = this.documents.map(doc => ({
      id: doc.id,
      tokens: preprocessText(doc.question).stemmedTokens
    }));

    // Step 2: Extract Vocabulary
    const vocabSet = new Set();
    processedDocs.forEach(doc => {
      doc.tokens.forEach(term => vocabSet.add(term));
    });
    this.vocabulary = Array.from(vocabSet);

    // Step 3: Compute Inverse Document Frequency (IDF)
    const N = processedDocs.length;
    this.vocabulary.forEach(term => {
      const docCount = processedDocs.filter(doc => doc.tokens.includes(term)).length;
      this.idfVector[term] = Math.log((N + 1) / (docCount + 1)) + 1; // Smoothed IDF
    });

    // Step 4: Calculate TF-IDF Vectors for Documents
    this.docVectors = processedDocs.map(doc => {
      return this.vectorize(doc.tokens);
    });
  }

  vectorize(tokens) {
    const tf = {};
    tokens.forEach(term => {
      tf[term] = (tf[term] || 0) + 1;
    });

    return this.vocabulary.map(term => {
      const termFreq = tf[term] || 0;
      const normalizedTF = termFreq / (tokens.length || 1);
      return normalizedTF * (this.idfVector[term] || 0);
    });
  }

  // Calculate Cosine Similarity between two numerical vectors
  calculateCosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Find matches for a user query string
  findBestMatches(query) {
    const queryPreprocessed = preprocessText(query);
    const queryVector = this.vectorize(queryPreprocessed.stemmedTokens);

    const scores = this.documents.map((doc, idx) => {
      const simScore = this.calculateCosineSimilarity(queryVector, this.docVectors[idx]);
      return {
        faq: doc,
        score: simScore
      };
    });

    // Sort by highest similarity
    scores.sort((a, b) => b.score - a.score);

    return {
      preprocessed: queryPreprocessed,
      matches: scores
    };
  }
}

// ==========================================================================
// 4. Chatbot UI Logic & Application Manager
// ==========================================================================

class ChatbotApp {
  constructor() {
    this.currentCategory = 'ecommerce';
    this.kb = [...FAQ_DATABASE[this.currentCategory]];
    this.engine = new TFIDFSimilarityEngine(this.kb);
    this.editingFaqId = null;

    this.cacheDOM();
    this.bindEvents();
    this.initUI();
  }

  cacheDOM() {
    // Header & Control elements
    this.faqCategorySelect = document.getElementById('faqCategory');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.toggleDebugBtn = document.getElementById('toggleDebugBtn');
    
    // Chat components
    this.chatMessages = document.getElementById('chatMessages');
    this.chatForm = document.getElementById('chatForm');
    this.userInput = document.getElementById('userInput');
    this.suggestionChips = document.getElementById('suggestionChips');
    this.clearChatBtn = document.getElementById('clearChatBtn');

    // Inspector components
    this.inspectorSection = document.getElementById('inspectorSection');
    this.inspectRawText = document.getElementById('inspectRawText');
    this.inspectTokens = document.getElementById('inspectTokens');
    this.inspectStemmed = document.getElementById('inspectStemmed');
    this.similarityList = document.getElementById('similarityList');
    this.faqListMini = document.getElementById('faqListMini');
    this.faqCount = document.getElementById('faqCount');

    // Modal elements
    this.faqModal = document.getElementById('faqModal');
    this.openFaqModalBtn = document.getElementById('openFaqModalBtn');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.cancelModalBtn = document.getElementById('cancelModalBtn');
    this.faqForm = document.getElementById('faqForm');
    this.faqQuestionInput = document.getElementById('faqQuestion');
    this.faqAnswerInput = document.getElementById('faqAnswer');
    this.modalTitle = document.getElementById('modalTitle');
  }

  bindEvents() {
    // Category Switcher
    this.faqCategorySelect.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.reloadKnowledgeBase();
    });

    // Dark Theme Toggle
    this.themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', targetTheme);
      this.themeToggleBtn.innerHTML = targetTheme === 'dark' 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
    });

    // Toggle Inspector Panel
    this.toggleDebugBtn.addEventListener('click', () => {
      this.inspectorSection.classList.toggle('collapsed');
    });

    // Send Message Form Submit
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserSubmit();
    });

    // Clear Chat
    this.clearChatBtn.addEventListener('click', () => {
      this.chatMessages.innerHTML = '';
      this.addBotMessage("Chat history cleared. How can I help you today?");
    });

    // Modal Controls
    this.openFaqModalBtn.addEventListener('click', () => this.openModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.cancelModalBtn.addEventListener('click', () => this.closeModal());
    this.faqForm.addEventListener('submit', (e) => this.handleFaqFormSubmit(e));
  }

  initUI() {
    this.reloadKnowledgeBase();
    this.addBotMessage("Hello! 👋 I am your AI Support Assistant. Ask me a question about our services!");
  }

  reloadKnowledgeBase() {
    this.kb = [...FAQ_DATABASE[this.currentCategory]];
    this.engine = new TFIDFSimilarityEngine(this.kb);
    this.renderSuggestionChips();
    this.renderMiniFaqList();
  }

  renderSuggestionChips() {
    this.suggestionChips.innerHTML = '';
    // Select first 3 questions as chips
    this.kb.slice(0, 4).forEach(item => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = item.question;
      chip.addEventListener('click', () => {
        this.userInput.value = item.question;
        this.handleUserSubmit();
      });
      this.suggestionChips.appendChild(chip);
    });
  }

  renderMiniFaqList() {
    this.faqCount.textContent = this.kb.length;
    this.faqListMini.innerHTML = '';

    this.kb.forEach(faq => {
      const item = document.createElement('div');
      item.className = 'faq-mini-item';
      item.innerHTML = `
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;" title="${faq.question}">
          ${faq.question}
        </span>
        <div class="faq-mini-actions">
          <button class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="del-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;

      item.querySelector('.edit-btn').addEventListener('click', () => this.openModal(faq));
      item.querySelector('.del-btn').addEventListener('click', () => this.deleteFaq(faq.id));

      this.faqListMini.appendChild(item);
    });
  }

  // ==========================================================================
  // Chat Operations
  // ==========================================================================

  handleUserSubmit() {
    const text = this.userInput.value.trim();
    if (!text) return;

    // Display User Message
    this.addUserMessage(text);
    this.userInput.value = '';

    // Show Typing Indicator
    const typingId = this.showTypingIndicator();

    // Process NLP & Similarity Math
    setTimeout(() => {
      this.removeTypingIndicator(typingId);
      const results = this.engine.findBestMatches(text);
      this.updateInspectorUI(text, results);

      const topMatch = results.matches[0];
      const similarityThreshold = 0.15; // Minimum similarity threshold

      if (topMatch && topMatch.score >= similarityThreshold) {
        this.addBotMessage(topMatch.faq.answer, topMatch.score);
      } else {
        this.addBotMessage(
          "I'm sorry, I couldn't find a close answer to your question in our knowledge base. Could you try rephrasing or asking something else?",
          0
        );
      }
    }, 600);
  }

  addUserMessage(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const html = `
      <div class="message-row user">
        <div class="avatar"><i class="fa-solid fa-user"></i></div>
        <div class="message-content">
          <div class="bubble">${this.escapeHTML(text)}</div>
          <div class="meta">${time}</div>
        </div>
      </div>
    `;
    this.chatMessages.insertAdjacentHTML('beforeend', html);
    this.scrollToBottom();
  }

  addBotMessage(text, score = null) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let confidenceBadge = '';
    if (score !== null) {
      const percentage = Math.round(score * 100);
      let badgeClass = 'confidence-low';
      if (percentage >= 50) badgeClass = 'confidence-high';
      else if (percentage >= 25) badgeClass = 'confidence-med';
      
      confidenceBadge = `<span class="confidence-badge ${badgeClass}">${percentage}% Match</span>`;
    }

    const html = `
      <div class="message-row bot">
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="message-content">
          <div class="bubble">${this.escapeHTML(text)}</div>
          <div class="meta">
            <span>${time}</span>
            ${confidenceBadge}
          </div>
          <div class="feedback-btns">
            <button class="feedback-btn" onclick="this.style.color='#10b981'"><i class="fa-regular fa-thumbs-up"></i> Helpful</button>
            <button class="feedback-btn" onclick="this.style.color='#ef4444'"><i class="fa-regular fa-thumbs-down"></i> Not Helpful</button>
          </div>
        </div>
      </div>
    `;
    this.chatMessages.insertAdjacentHTML('beforeend', html);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const html = `
      <div class="message-row bot" id="${id}">
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="message-content">
          <div class="bubble">
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    `;
    this.chatMessages.insertAdjacentHTML('beforeend', html);
    this.scrollToBottom();
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  // ==========================================================================
  // NLP Inspector UI Rendering
  // ==========================================================================

  updateInspectorUI(rawQuery, results) {
    this.inspectRawText.textContent = `"${rawQuery}"`;
    this.inspectTokens.textContent = JSON.stringify(results.preprocessed.tokens);
    this.inspectStemmed.textContent = JSON.stringify(results.preprocessed.stemmedTokens);

    this.similarityList.innerHTML = '';

    results.matches.forEach(item => {
      const percentage = Math.round(item.score * 100);
      const row = document.createElement('div');
      row.className = 'similarity-item';
      row.innerHTML = `
        <div class="similarity-info">
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px;">
            ${item.faq.question}
          </span>
          <strong>${percentage}%</strong>
        </div>
        <div class="similarity-bar-bg">
          <div class="similarity-bar-fill" style="width: ${percentage}%"></div>
        </div>
      `;
      this.similarityList.appendChild(row);
    });
  }

  // ==========================================================================
  // Knowledge Base CRUD Operations
  // ==========================================================================

  openModal(faq = null) {
    if (faq) {
      this.editingFaqId = faq.id;
      this.modalTitle.textContent = 'Edit FAQ Item';
      this.faqQuestionInput.value = faq.question;
      this.faqAnswerInput.value = faq.answer;
    } else {
      this.editingFaqId = null;
      this.modalTitle.textContent = 'Add New FAQ Item';
      this.faqForm.reset();
    }
    this.faqModal.classList.add('active');
  }

  closeModal() {
    this.faqModal.classList.remove('active');
  }

  handleFaqFormSubmit(e) {
    e.preventDefault();
    const question = this.faqQuestionInput.value.trim();
    const answer = this.faqAnswerInput.value.trim();

    if (!question || !answer) return;

    if (this.editingFaqId) {
      const item = FAQ_DATABASE[this.currentCategory].find(f => f.id === this.editingFaqId);
      if (item) {
        item.question = question;
        item.answer = answer;
      }
    } else {
      const newFaq = {
        id: 'custom-' + Date.now(),
        question,
        answer
      };
      FAQ_DATABASE[this.currentCategory].push(newFaq);
    }

    this.closeModal();
    this.reloadKnowledgeBase();
  }

  deleteFaq(id) {
    FAQ_DATABASE[this.currentCategory] = FAQ_DATABASE[this.currentCategory].filter(item => item.id !== id);
    this.reloadKnowledgeBase();
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ChatbotApp();
});