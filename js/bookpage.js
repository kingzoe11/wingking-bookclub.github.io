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

// Update progress and save it to Backend
function updateProgress(profileId) {
  const chapterInput = document.getElementById(`${profileId}-chapter`);
  const chapterNumber = parseInt(chapterInput.value, 10);
  
  if (isNaN(chapterNumber) || chapterNumber < 0 || chapterNumber > numChapters) {
    alert(`Please enter a valid chapter number between 0 and ${numChapters}.`);
    return;
  }

  // Show loading indicator
  showLoading(true);
  
  // Send progress update to the backend
  fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookId: bookId,
      chapter: chapterNumber
    })
  })
  .then(response => response.json())
  .then(data => {
    const progressPercentage = Math.round((chapterNumber / numChapters) * 100);
    updateProgressBar(profileId, progressPercentage);
    console.log(`Progress updated for ${profileId}: Chapter ${chapterNumber} (${progressPercentage}%).`);
  })
  .catch(err => {
    console.error("Error updating progress:", err);
    alert("Error updating progress. Please try again later.");
  })
  .finally(() => {
    // Hide loading indicator
    showLoading(false);
  });
}

// Load progress for all profiles from Backend
function loadProgress() {
  document.querySelectorAll(".profile").forEach((profile) => {
    const profileId = profile.querySelector(".profile-circle").id.split("-")[0];

    // Show loading indicator
    showLoading(true);

    fetch(`/api/progress?bookId=${bookId}`)
      .then(response => response.json())
      .then(data => {
        const chapterNumber = data.chapter;
        const progressPercentage = Math.round((chapterNumber / numChapters) * 100);
        updateProgressBar(profileId, progressPercentage);

        const chapterInput = document.getElementById(`${profileId}-chapter`);
        if (chapterInput) chapterInput.value = chapterNumber;

        console.log(`Loaded progress for ${profileId}: Chapter ${chapterNumber} (${progressPercentage}%).`);
      })
      .catch(err => {
        console.error("Error loading progress:", err);
        alert("Error loading progress. Please try again later.");
      })
      .finally(() => {
        // Hide loading indicator
        showLoading(false);
      });
  });
}

// Show or hide the loading spinner
function showLoading(isLoading) {
  const loadingSpinner = document.getElementById("loading-spinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = isLoading ? "block" : "none";
  }
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

// Submit a comment for a chapter and save it to Backend
function submitComment(chapterId) {
  const commentInput = document.getElementById(`comment-input-${chapterId}`);
  let commentText = commentInput.value.trim();
  
  if (commentText === "") {
    alert("Please enter a valid comment.");
    return;
  }

  // Simple input sanitization to prevent XSS
  commentText = commentText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  // Show loading indicator
  showLoading(true);

  // Send comment to backend
  fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookId: bookId,
      chapter: chapterId.replace('chapter', ''),
      commentText: commentText
    })
  })
  .then(response => response.json())
  .then(data => {
    // Reload comments after submission
    loadComments();
    console.log("Comment submitted.");
  })
  .catch(err => {
    console.error("Error submitting comment:", err);
    alert("Error submitting comment. Please try again later.");
  })
  .finally(() => {
    // Hide loading indicator
    showLoading(false);
  });

  commentInput.value = "";
}

// Load saved comments from backend for all chapters
function loadComments() {
  for (let i = 1; i <= numChapters; i++) {
    const chapterId = `chapter${i}`;
    
    // Show loading indicator
    showLoading(true);

    fetch(`/api/comments?bookId=${bookId}&chapter=${i}`)
      .then(response => response.json())
      .then(comments => {
        const commentContainer = document.getElementById(`comment-container-${chapterId}`);
        commentContainer.innerHTML = '';  // Clear previous comments

        comments.forEach((comment) => {
          const commentDiv = document.createElement("div");
          commentDiv.classList.add("comment");
          commentDiv.innerHTML = `<p>${comment.commentText}</p>`;
          commentContainer.appendChild(commentDiv);
        });
      })
      .catch(err => {
        console.error("Error loading comments:", err);
        alert("Error loading comments. Please try again later.");
      })
      .finally(() => {
        // Hide loading indicator
        showLoading(false);
      });
  }
}
