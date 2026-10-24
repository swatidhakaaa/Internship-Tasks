document.addEventListener("DOMContentLoaded", () => {
  const toggleFurnitureBtn = document.getElementById("toggleFurnitureBtn");
  const toggleDimensionsBtn = document.getElementById("toggleDimensionsBtn");
  const resetZoomBtn = document.getElementById("resetZoomBtn");

  const furnitureGroup = document.getElementById("furnitureGroup");
  const dimensionsGroup = document.getElementById("dimensionsGroup");
  const roomRects = document.querySelectorAll(".room-bg");
  const infoBox = document.getElementById("infoBox");

  // Toggle Furniture Visibility
  toggleFurnitureBtn.addEventListener("click", () => {
    const isVisible = furnitureGroup.style.display !== "none";
    furnitureGroup.style.display = isVisible ? "none" : "block";
    toggleFurnitureBtn.classList.toggle("active", !isVisible);
  });

  // Toggle Dimension Lines Visibility
  toggleDimensionsBtn.addEventListener("click", () => {
    const isVisible = dimensionsGroup.style.display !== "none";
    dimensionsGroup.style.display = isVisible ? "none" : "block";
    toggleDimensionsBtn.classList.toggle("active", !isVisible);
  });

  // Reset Interactivity View
  resetZoomBtn.addEventListener("click", () => {
    furnitureGroup.style.display = "block";
    dimensionsGroup.style.display = "block";
    toggleFurnitureBtn.classList.add("active");
    toggleDimensionsBtn.classList.add("active");
    infoBox.innerHTML =
      "<p>Hover over or tap any room on the plan to inspect detailed dimensions.</p>";
  });

  // Hover and Selection Events for Floor Plan Rooms
  roomRects.forEach((room) => {
    room.addEventListener("mouseenter", (e) => {
      const name = e.target.getAttribute("data-room");
      const size = e.target.getAttribute("data-size");
      infoBox.innerHTML = `
        <strong>Selected Space:</strong><br/>
        <span>${name}</span><br/>
        <small>Dimensions: ${size}</small>
      `;
    });

    room.addEventListener("mouseleave", () => {
      infoBox.innerHTML =
        "<p>Hover over or tap any room on the plan to inspect detailed dimensions.</p>";
    });
  });
});