// Get the total number of chapters from the HTML attribute and book ID
const bookId = document.body.getAttribute("data-book-id");
const numChapters = parseInt(document.body.getAttribute("data-num-chapters"), 10);
// Load progress and comments when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing...");
  generateChapterSections();
  loadProgress();
  loadComments();
});
// Update progress and save it to localStorage
function updateProgress(profileId) {
    const chapterInput = document.getElementById(`${profileId}-chapter`);
    const chapterNumber = parseInt(chapterInput.value, 10);
  
    // Validate the chapter number input
    if (isNaN(chapterNumber) || chapterNumber < 0 || chapterNumber > numChapters) {
      alert(`Please enter a valid chapter number between 0 and ${numChapters}.`);
      return;
    }
  
    // Save the progress to localStorage with the bookId
    localStorage.setItem(`${bookId}-${profileId}`, chapterNumber);
  
    // Calculate progress percentage and update the progress bar
    const progressPercentage = Math.round((chapterNumber / numChapters) * 100);
    updateProgressBar(profileId, progressPercentage);
  
    console.log(`Progress updated for ${profileId}: Chapter ${chapterNumber} (${progressPercentage}%).`);
  }  
// Load progress for all profiles from localStorage
function loadProgress() {
    document.querySelectorAll(".profile").forEach((profile) => {
      const profileId = profile.querySelector(".profile-circle").id.split("-")[0]; // e.g., 'profile1'
      const savedChapter = localStorage.getItem(`${bookId}-${profileId}`);
  
      if (savedChapter !== null) {
        const chapterNumber = parseInt(savedChapter, 10);
        const progressPercentage = Math.round((chapterNumber / numChapters) * 100);
  
        // Update the progress bar and input field
        updateProgressBar(profileId, progressPercentage);
  
        const chapterInput = document.getElementById(`${profileId}-chapter`);
        if (chapterInput) chapterInput.value = chapterNumber;
  
        console.log(`Loaded progress for ${profileId}: Chapter ${chapterNumber} (${progressPercentage}%).`);
      } else {
        console.log(`No saved progress found for ${profileId}.`);
      }
    });
  }  
// Update the visual progress bar
function updateProgressBar(profileId, progressPercentage) {
  const profileCircle = document.getElementById(`${profileId}-circle`);
  if (profileCircle) {
    profileCircle.style.background = `conic-gradient(
      #4caf50 0% ${progressPercentage}%,
      #d3d3d3 ${progressPercentage}% 100%
    )`;
    profileCircle.setAttribute("data-progress", `${progressPercentage}%`);
  } else {
    console.error(`Profile circle not found for ${profileId}.`);
  }
}
// Dynamically generate chapter sections for comments
function generateChapterSections() {
  const chapterContainer = document.getElementById("chapter-comments");
  if (!chapterContainer) {
    console.error("Chapter container not found!");
    return;
  }
  // Clear existing content (if any)
  chapterContainer.innerHTML = "";
  // Create sections for each chapter
  for (let i = 1; i <= numChapters; i++) {
    const chapterHTML = `
      <div class="chapter" id="chapter${i}">
        <h3>Chapter ${i}</h3>
        <button class="dropbtn" onclick="toggleCommentSection('chapter${i}')">Show Comments</button>
        <div class="comment-section" style="display: none;">
          <div class="comment-container" id="comment-container-chapter${i}"></div>
          <input type="text" id="comment-input-chapter${i}" placeholder="Add your thoughts...">
          <button onclick="submitComment('chapter${i}')">Submit</button>
        </div>
      </div>
    `;
    chapterContainer.innerHTML += chapterHTML;
  }
}
// Toggle visibility of the comment section for a chapter
function toggleCommentSection(chapterId) {
  const commentSection = document.querySelector(`#${chapterId} .comment-section`);
  if (commentSection) {
    commentSection.style.display = commentSection.style.display === "block" ? "none" : "block";
  } else {
    console.error(`Comment section not found for ${chapterId}.`);
  }
}
// Submit a comment for a chapter and save it to localStorage
function submitComment(chapterId) {
    const commentInput = document.getElementById(`comment-input-${chapterId}`);
    const commentText = commentInput.value.trim();
  
    if (commentText === "") {
      alert("Please enter a valid comment.");
      return;
    }
  
    const commentContainer = document.getElementById(`comment-container-${chapterId}`);
    const newComment = document.createElement("div");
    newComment.classList.add("comment");
    newComment.innerHTML = `<p><strong>You:</strong> ${commentText}</p>`;
    commentContainer.appendChild(newComment);
  
    // Save the comment to localStorage with the bookId
    const savedComments = JSON.parse(localStorage.getItem(`${bookId}-${chapterId}`)) || [];
    savedComments.push(commentText);
    localStorage.setItem(`${bookId}-${chapterId}`, JSON.stringify(savedComments));
  
    commentInput.value = "";
}  
// Load saved comments from localStorage for all chapters
function loadComments() {
    for (let i = 1; i <= numChapters; i++) {
      const chapterId = `chapter${i}`;
      const savedComments = JSON.parse(localStorage.getItem(`${bookId}-${chapterId}`)) || [];
      const commentContainer = document.getElementById(`comment-container-${chapterId}`);
  
      savedComments.forEach((comment) => {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comment");
        commentDiv.innerHTML = `<p><strong>You:</strong> ${comment}</p>`;
        commentContainer.appendChild(commentDiv);
      });
    }
  }
  