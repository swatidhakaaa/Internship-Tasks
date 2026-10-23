const quotes = [
    {
        text: "Be the change you wish to see in the world.",
        author: "Mahatma Gandhi"
    },
    {
        text: "I have not failed. I've just found 10,000 ways that won't work.",
        author: "Thomas Edison"
    },
    {
        text: "In three words I can sum up everything I've learned about life: it goes on.",
        author: "Robert Frost"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    },
    {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius"
    },
    {
        text: "Everything you can imagine is real.",
        author: "Pablo Picasso"
    },
    {
        text: "Simplicity is the ultimate sophistication.",
        author: "Leonardo da Vinci" 
    }
]; 

const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const newQuoteBtn = document.getElementById("new-quote-btn");

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // Add subtle fade animation effect
    quoteText.style.opacity = 0;
    quoteAuthor.style.opacity = 0;  

    setTimeout(() => {
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
        quoteText.style.opacity = 1;
        quoteAuthor.style.opacity = 1;
    }, 150);
}

// Add transition styles to JS-drive changes
quoteText.style.transition = "opacity 0.15s ease-in-out";
quoteAuthor.style.transition = "opacity 0.15s ease-in-out";

// Event listener for button click
newQuoteBtn.addEventListener("click", getRandomQuote);
