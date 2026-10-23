// Wait until the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    
    // Select elements from the DOM
    const actionButton = document.getElementById("actionBtn");
    const statusMessage = document.getElementById("statusMessage");
    const title = document.getElementById("title");

    let isClicked = false;

    // Add click event listener to the button
    actionButton.addEventListener("click", () => {
        isClicked = !isClicked;

        if (isClicked) {
            statusMessage.classList.remove("hidden");
            actionButton.textContent = "Reset";
            actionButton.style.backgroundColor = "#dc3545"; // Change button to red
            title.textContent = "Welcome Aboard!";
        } else {
            statusMessage.classList.add("hidden");
            actionButton.textContent = "Click Me";
            actionButton.style.backgroundColor = "#007bff"; // Restore blue color
            title.textContent = "Interactive App";
        }
    });
});