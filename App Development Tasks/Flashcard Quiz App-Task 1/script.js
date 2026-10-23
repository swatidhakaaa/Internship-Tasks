  // Default Cards Data
        let flashcards = [
            { id: 1, question: "What is HTML?", answer: "HTML stands for HyperText Markup Language. It structures web content." },
            { id: 2, question: "What is CSS?", answer: "CSS stands for Cascading Style Sheets. It controls presentation and layout." },
            { id: 3, question: "What does JS stand for?", answer: "JS stands for JavaScript, a dynamic language for web interactive logic." }
        ];

        let currentIndex = 0;
        let isFlipped = false;
        let editCardId = null;

        // DOM Elements
        const flashcard = document.getElementById("flashcard");
        const cardQuestion = document.getElementById("card-question");
        const cardAnswer = document.getElementById("card-answer");
        const cardCounter = document.getElementById("card-counter");
        const flipBtn = document.getElementById("flip-btn");
        const prevBtn = document.getElementById("prev-btn");
        const nextBtn = document.getElementById("next-btn");
        const addCardBtn = document.getElementById("add-card-btn");
        const editBtn = document.getElementById("edit-btn");
        const deleteBtn = document.getElementById("delete-btn");

        const modalOverlay = document.getElementById("modal-overlay");
        const cardForm = document.getElementById("card-form");
        const questionInput = document.getElementById("question-input");
        const answerInput = document.getElementById("answer-input");
        const modalTitle = document.getElementById("modal-title");
        const cancelBtn = document.getElementById("cancel-btn");

        // Render Current Card
        function renderCard() {
            isFlipped = false;
            flashcard.classList.remove("flipped");
            flipBtn.textContent = "Show Answer";

            if (flashcards.length === 0) {
                cardQuestion.textContent = "No flashcards left. Click '+ Add New Card' to create one!";
                cardAnswer.textContent = "";
                cardCounter.textContent = "0 of 0";
                editBtn.disabled = true;
                deleteBtn.disabled = true;
                prevBtn.disabled = true;
                nextBtn.disabled = true;
                flipBtn.disabled = true;
                return;
            }

            editBtn.disabled = false;
            deleteBtn.disabled = false;
            prevBtn.disabled = flashcards.length <= 1;
            nextBtn.disabled = flashcards.length <= 1;
            flipBtn.disabled = false;

            const card = flashcards[currentIndex];
            cardQuestion.textContent = card.question;
            cardAnswer.textContent = card.answer;
            cardCounter.textContent = `Card ${currentIndex + 1} of ${flashcards.length}`;
        }

        // Toggle Flip
        function toggleFlip() {
            if (flashcards.length === 0) return;
            isFlipped = !isFlipped;
            flashcard.classList.toggle("flipped", isFlipped);
            flipBtn.textContent = isFlipped ? "Hide Answer" : "Show Answer";
        }

        // Navigation
        prevBtn.addEventListener("click", () => {
            if (flashcards.length === 0) return;
            currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
            renderCard();
        });

        nextBtn.addEventListener("click", () => {
            if (flashcards.length === 0) return;
            currentIndex = (currentIndex + 1) % flashcards.length;
            renderCard();
        });

        flipBtn.addEventListener("click", toggleFlip);
        flashcard.addEventListener("click", toggleFlip);

        // Open Modal (Add Mode)
        addCardBtn.addEventListener("click", () => {
            editCardId = null;
            modalTitle.textContent = "Add New Flashcard";
            questionInput.value = "";
            answerInput.value = "";
            modalOverlay.classList.add("active");
        });

        // Open Modal (Edit Mode)
        editBtn.addEventListener("click", () => {
            if (flashcards.length === 0) return;
            editCardId = flashcards[currentIndex].id;
            modalTitle.textContent = "Edit Flashcard";
            questionInput.value = flashcards[currentIndex].question;
            answerInput.value = flashcards[currentIndex].answer;
            modalOverlay.classList.add("active");
        });

        // Close Modal
        cancelBtn.addEventListener("click", () => {
            modalOverlay.classList.remove("active");
        });

        // Handle Save
        cardForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const qVal = questionInput.value.trim();
            const aVal = answerInput.value.trim();

            if (!qVal || !aVal) return;

            if (editCardId !== null) {
                // Edit mode
                const card = flashcards.find(c => c.id === editCardId);
                if (card) {
                    card.question = qVal;
                    card.answer = aVal;
                }
            } else {
                // Add mode
                const newCard = {
                    id: Date.now(),
                    question: qVal,
                    answer: aVal
                };
                flashcards.push(newCard);
                currentIndex = flashcards.length - 1;
            }

            modalOverlay.classList.remove("active");
            renderCard();
        });

        // Delete Card
        deleteBtn.addEventListener("click", () => {
            if (flashcards.length === 0) return;
            if (confirm("Are you sure you want to delete this flashcard?")) {
                flashcards.splice(currentIndex, 1);
                if (currentIndex >= flashcards.length && flashcards.length > 0) {
                    currentIndex = flashcards.length - 1;
                }
                renderCard();
            }
        });

        // Initial Initialization
        renderCard();