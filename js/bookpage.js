// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { ref, getDatabase, get, set, push } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDauBHESMBKtdbh_Xfy6UQhm6M5toeoahU",
  authDomain: "wingkink-book-club.firebaseapp.com",
  databaseURL: "https://wingkink-book-club-default-rtdb.firebaseio.com",
  projectId: "wingkink-book-club",
  storageBucket: "wingkink-book-club.firebasestorage.app",
  messagingSenderId: "599906607161",
  appId: "1:599906607161:web:b15cd4e072f28ebbd6ade8",
  measurementId: "G-0MBY6P635G"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);  // Initialize the database reference

// Get the total number of chapters from the HTML attribute and book ID
const bookId = document.body.getAttribute("data-book-id");
const numChapters = parseInt(document.body.getAttribute("data-num-chapters"), 10);

// Track the active chapter for comment submission
let activeChapterId = null;

// Load progress and comments when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing...");
  generateChapterSections();
  loadProgress();
  loadComments();
});

// Update progress for a specific profile
function updateProgress(profileId) {
  const chapterInput = document.getElementById(`${profileId}-chapter`);
  const chapterNumber = parseInt(chapterInput.value, 10);

  if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > numChapters) {
    alert(`Please enter a valid chapter number between 1 and ${numChapters}.`);
    return;
  }

  // Set the progress to Firebase Realtime Database
  const progressRef = ref(database, 'progress/' + profileId); // Save data under 'progress/profileId'
  set(progressRef, {
    chapter: chapterNumber
  }).then(() => {
    console.log(`Progress saved for ${profileId}: Chapter ${chapterNumber}`);
  }).catch((error) => {
    console.error("Error saving progress: ", error);
  });
}

// Load progress for all profiles from Firebase Realtime Database
function loadProgress() {
  document.querySelectorAll(".profile").forEach((profile) => {
    const profileId = profile.querySelector(".profile-circle").id.split("-")[0];
    const progressRef = ref(database, 'progress/' + profileId); // Get progress for profileId

    // Fetch progress from Firebase
    get(progressRef).then((snapshot) => {
      if (snapshot.exists()) {
        const chapterNumber = snapshot.val().chapter;
        const progressPercentage = Math.round((chapterNumber / numChapters) * 100);

        // Update the progress bar
        updateProgressBar(profileId, progressPercentage);

        // Update input field with saved chapter number
        const chapterInput = document.getElementById(`${profileId}-chapter`);
        if (chapterInput) chapterInput.value = chapterNumber;

        console.log(`Loaded progress for ${profileId}: Chapter ${chapterNumber} (${progressPercentage}%)`);
      } else {
        console.log(`No progress found for ${profileId}`);
      }
    }).catch((error) => {
      console.error("Error loading progress: ", error);
    });
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

  // Clear existing content
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
          <button type="button" id="submit-button-chapter${i}">Submit</button>
        </div>
      </div>
    `;
    chapterContainer.innerHTML += chapterHTML;

    // Add event listener for the submit button
    document.getElementById(`submit-button-chapter${i}`).addEventListener("click", () => {
      submitComment(`chapter${i}`);
    });

    // Load comments for the chapter
    loadComments(`chapter${i}`);
  }
}

// Toggle visibility of the comment section for a chapter
window.toggleCommentSection = function (chapterId) {
  const commentSection = document.querySelector(`#${chapterId} .comment-section`);
  if (commentSection) {
    const currentDisplay = getComputedStyle(commentSection).display;
    commentSection.style.display = currentDisplay === "none" ? "block" : "none";
  } else {
    console.error(`Comment section not found for ${chapterId}.`);
  }
};

// Submit comments to Firebase Realtime Database
function submitComment(chapterId) {
  const commentInput = document.getElementById(`comment-input-${chapterId}`);
  if (!commentInput) {
    console.error(`Comment input not found for ${chapterId}`);
    return;
  }

  const commentText = commentInput.value.trim();
  if (commentText === "") {
    alert("Please enter a valid comment.");
    return;
  }

  const commentsRef = ref(database, `comments/${bookId}/${chapterId}`);
  const newCommentRef = push(commentsRef);

  set(newCommentRef, {
    text: commentText,
    profileId: 'user', // Replace with actual profileId if needed
    timestamp: Date.now()
  })
    .then(() => {
      console.log(`Comment saved for ${chapterId}: ${commentText}`);
      commentInput.value = ""; // Clear input field
      loadComments(chapterId); // Reload comments
    })
    .catch((error) => {
      console.error("Error saving comment: ", error);
    });
}

// Load saved comments from Firebase for a specific chapter
function loadComments(chapterId) {
  const commentsRef = ref(database, `comments/${bookId}/${chapterId}`);
  const commentContainer = document.getElementById(`comment-container-${chapterId}`);

  if (!commentContainer) {
    console.error(`Comment container not found for ${chapterId}`);
    return;
  }

  // Clear existing comments
  commentContainer.innerHTML = "";

  get(commentsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const comments = snapshot.val();
        for (const commentKey in comments) {
          const comment = comments[commentKey];
          const commentDiv = document.createElement("div");
          commentDiv.classList.add("comment");
          commentDiv.innerHTML = `<p><strong>${comment.profileId}:</strong> ${comment.text}</p>`;
          commentContainer.appendChild(commentDiv);
        }
      } else {
        console.log(`No comments found for ${chapterId}`);
      }
    })
    .catch((error) => {
      console.error(`Error loading comments for ${chapterId}:`, error);
    });
}


