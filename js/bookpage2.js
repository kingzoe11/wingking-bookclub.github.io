// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);  // Updated to use getDatabase for SDK v9

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

// Update progress and save it to Firebase
function updateProgress(profileId) {
    const chapterInput = document.getElementById(`${profileId}-chapter`);
    const chapterNumber = parseInt(chapterInput.value, 10);
  
    if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > numChapters) {
      alert(`Please enter a valid chapter number between 1 and ${numChapters}.`);
      return;
    }
  
    // Save progress to Firebase using the updated syntax
    const progressRef = ref(database, `progress/${profileId}`);
    set(progressRef, {
      chapter: chapterNumber
    }).then(() => {
      console.log(`Progress saved for ${profileId}: Chapter ${chapterNumber}`);
    }).catch((error) => {
      console.error("Error saving progress: ", error);
    });
  
    // Calculate progress percentage and update the progress bar
    const progressPercentage = Math.round((chapterNumber / numChapters) * 100);
    updateProgressBar(profileId, progressPercentage);
  }
  

// Load progress for all profiles from Firebase
function loadProgress() {
    document.querySelectorAll(".profile").forEach((profile) => {
      const profileId = profile.querySelector(".profile-circle").id.split("-")[0]; // e.g., 'profile1'
      const progressRef = ref(database, `progress/${profileId}`);
  
      get(progressRef).then((snapshot) => {
        if (snapshot.exists()) {
          const chapterNumber = snapshot.val().chapter;
          const progressPercentage = Math.round((chapterNumber / numChapters) * 100);
  
          // Update the progress bar and input field
          updateProgressBar(profileId, progressPercentage);
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

// Submit a comment for a chapter and save it to Firebase
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
  
    // Save the comment to Firebase using the updated syntax
    const commentsRef = ref(database, `comments/${bookId}/${chapterId}`);
    const newCommentRef = push(commentsRef);
    set(newCommentRef, {
      text: commentText,
      profileId: "user",  // Replace with actual profile ID if you have user authentication
      timestamp: Date.now(),
    }).then(() => {
      console.log(`Comment saved for ${chapterId}: ${commentText}`);
      commentInput.value = "";  // Clear the input field
    }).catch((error) => {
      console.error("Error saving comment: ", error);
    });
  }
  

// Load saved comments from Firebase for all chapters
function loadComments() {
    for (let i = 1; i <= numChapters; i++) {
      const chapterId = `chapter${i}`;
      const commentsRef = ref(database, `comments/${bookId}/${chapterId}`);
      const commentContainer = document.getElementById(`comment-container-${chapterId}`);
  
      get(commentsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const comments = snapshot.val();
          Object.values(comments).forEach((comment) => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");
            commentDiv.innerHTML = `<p><strong>${comment.profileId}:</strong> ${comment.text}</p>`;
            commentContainer.appendChild(commentDiv);
          });
        } else {
          console.log(`No comments found for ${chapterId}`);
        }
      }).catch((error) => {
        console.error("Error loading comments: ", error);
      });
    }
  }
  
