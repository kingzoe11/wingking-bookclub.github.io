// Get the total number of chapters from the HTML attribute and book ID
const bookId = document.body.getAttribute("data-book-id");
const numChapters = parseInt(document.body.getAttribute("data-num-chapters"), 10);

// Initialize Firebase
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Load progress and comments when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing...");
  generateChapterSections();
  loadProgress();
  loadComments();

  // Load comments for all chapters dynamically
  for (let i = 1; i <= numChapters; i++) {
    displayComments(`chapter${i}`);
  }
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

// Function to display comments
function displayComments(chapterId) {
  const commentSection = document.getElementById(`comment-container-${chapterId}`);
  const commentsRef = database.ref('comments/' + chapterId);

  commentsRef.on('value', (snapshot) => {
    commentSection.innerHTML = ''; // Clear existing comments
    const comments = snapshot.val();
    if (comments) {
      Object.keys(comments).forEach((key) => {
        const comment = comments[key];
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `<p><strong>${comment.username}</strong>: ${comment.text}</p>`;
        commentSection.appendChild(commentElement);
      });
    }
  });
}

// Function to post a new comment
function postComment(chapterId, username, text) {
  const commentsRef = database.ref('comments/' + chapterId);
  const newCommentRef = commentsRef.push();
  newCommentRef.set({
    username: username,
    text: text
  });
}

// Example to trigger the comment posting from the UI
function submitComment(chapterId) {
  const commentInput = document.getElementById(`comment-input-${chapterId}`);
  const commentText = commentInput.value.trim();

  if (commentText === "") {
    alert("Please enter a valid comment.");
    return;
  }

  // Fetch username from Firebase auth or set as Guest
  const username = firebase.auth().currentUser ? firebase.auth().currentUser.displayName || firebase.auth().currentUser.email : "Guest";

  // Post comment to Firebase
  postComment(chapterId, username, commentText);

  commentInput.value = ""; // Clear input after submission
}

// Load saved comments from Firebase for all chapters
function loadComments() {
  for (let i = 1; i <= numChapters; i++) {
    displayComments(`chapter${i}`);
  }
}

// Firebase Authentication
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User is signed in: ", user.displayName || user.email);
  } else {
    console.log("No user is signed in.");
  }
});
