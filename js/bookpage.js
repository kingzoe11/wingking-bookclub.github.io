// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { ref, getDatabase, get, set, push } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDauBHESMBKtdbh_Xfy6UQhm6M5toeoahU",
  authDomain: "wingkink-book-club.firebaseapp.com",
  databaseURL: "https://wingkink-book-club-default-rtdb.firebaseio.com",
  projectId: "wingkink-book-club",
  storageBucket: "wingkink-book-club.appspot.com",
  messagingSenderId: "599906607161",
  appId: "1:599906607161:web:b15cd4e072f28ebbd6ade8",
  measurementId: "G-0MBY6P635G"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Initialize the database reference

// Get book ID and number of chapters from HTML attributes
const bookId = document.body.getAttribute("data-book-id");
const numChapters = parseInt(document.body.getAttribute("data-num-chapters"), 10);

// Load progress and comments when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing...");
  generateChapterSections();
  loadComments();
});

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

  const commentsRef = ref(database, `comments/${bookId}/${chapterId}`);
  const newCommentRef = push(commentsRef);

  set(newCommentRef, {
    text: commentText,
    profileId: "user", // Replace with actual profile ID if needed
    timestamp: Date.now()
  })
    .then(() => {
      console.log(`Comment saved for ${chapterId}: ${commentText}`);
      const commentContainer = document.getElementById(`comment-container-${chapterId}`);
      const newComment = document.createElement("div");
      newComment.classList.add("comment");
      newComment.innerHTML = `<p><strong>You:</strong> ${commentText}</p>`;
      commentContainer.appendChild(newComment);
      commentInput.value = ""; // Clear input field
    })
    .catch((error) => {
      console.error("Error saving comment: ", error);
    });
}

// Load saved comments from Firebase for all chapters
function loadComments() {
  for (let i = 1; i <= numChapters; i++) {
    const chapterId = `chapter${i}`;
    const commentsRef = ref(database, `comments/${bookId}/${chapterId}`);
    const commentContainer = document.getElementById(`comment-container-${chapterId}`);

    get(commentsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const comments = snapshot.val();
          Object.values(comments).forEach((comment) => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");
            commentDiv.innerHTML = `<p><strong>${comment.profileId}:</strong> ${comment.text}</p>`;
            commentContainer.appendChild(commentDiv);
          });
        } else {
          console.log(`No comments found for ${chapterId}.`);
        }
      })
      .catch((error) => {
        console.error(`Error loading comments for ${chapterId}:`, error);
      });
  }
}


