// JavaScript to make the title box disappear on scroll and the directory box appear
window.addEventListener("scroll", function() {
  const titleBox = document.querySelector(".title-box");
  const directoryBox = document.querySelector(".directory-box");

  // When the user scrolls more than 50px
  if (window.scrollY > 50) {
    titleBox.style.transform = "translateY(-300%)";  // Slide the title box off-screen
    directoryBox.style.transform = "translateY(-165%)";  // Slide the directory box into view
  } else {
    titleBox.style.transform = "translateY(0)";  // Bring the title box back into view
    directoryBox.style.transform = "translateY(100%)";  // Hide the directory box
  }
});

// The correct 4-digit code
const correctCode = "012125";

// Get the modal and other necessary elements
const modal = document.getElementById("codeModal");
const codeInput = document.getElementById("codeInput");
const submitButton = document.getElementById("submitCode");
const errorMessage = document.getElementById("error-message");

// Variable to store the target page for redirection
let targetPage = "";

// Book links that trigger the modal
const bookLinks = document.querySelectorAll(".discussion-link");

bookLinks.forEach(link => {
  link.addEventListener("click", function(event) {
    // Prevent default navigation behavior of the link
    event.preventDefault();

    // Show the modal when a book is clicked
    modal.style.display = "flex";

    // Store the target page URL from the clicked link
    targetPage = link.getAttribute("data-target");
  });
});

// Handle the submit button click inside the modal
submitButton.addEventListener("click", function() {
  const enteredCode = codeInput.value;

  if (enteredCode === correctCode) {
    // Close the modal and redirect to the discussion page
    modal.style.display = "none";
    if (targetPage) {
      window.location.href = targetPage; // Redirect to the target page
    }
  } else {
    // Show the error message if the code is incorrect
    errorMessage.style.display = "block";
  }
});

// Close the modal if the user clicks outside the modal content
window.addEventListener("click", function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
