// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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


//testing data base
// ------------------------------------------------------------------------------------------------------------------------------------------

// Write to the database
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const dbRef = ref(database);

// Test writing
set(ref(database, 'test/'), {
  username: "test_user",
  message: "Hello, Firebase!"
})
  .then(() => {
    console.log("Data written successfully!");
  })
  .catch((error) => {
    console.error("Error writing data:", error);
  });

// Test reading
get(child(dbRef, 'test/'))
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log("Data read successfully:", snapshot.val());
    } else {
      console.log("No data available.");
    }
  })
  .catch((error) => {
    console.error("Error reading data:", error);
  });

// ------------------------------------------------------------------------------------------------------------------------------------------


// Get the total number of chapters from the HTML attribute and book ID (no change from local)
const bookId = document.body.getAttribute("data-book-id");
const numChapters = parseInt(document.body.getAttribute("data-num-chapters"), 10);

// Load progress and comments when the page loads (no change from local)
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
  
    // Validate the chapter number input
    if (isNaN(chapterNumber) || chapterNumber < 0 || chapterNumber > numChapters) {
      alert(`Please enter a valid chapter number between 0 and ${numChapters}.`);
      return;
    }

    //// Save the progress to localStorage with the bookId
    // localStorage.setItem(`${bookId}-${profileId}`, chapterNumber);
  
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

    console.log(`Progress updated for ${profileId}: Chapter ${chapterNumber} (${progressPercentage}%).`);
  }
  
// Load progress for all profiles from Firebase
function loadProgress() {
    document.querySelectorAll(".profile").forEach((profile) => {
      const profileId = profile.querySelector(".profile-circle").id.split("-")[0]; // e.g., 'profile1'

      //const savedChapter = localStorage.getItem(`${bookId}-${profileId}`);
  
      //if (savedChapter !== null) {
      //  const chapterNumber = parseInt(savedChapter, 10);
      //  const progressPercentage = Math.round((chapterNumber / numChapters) * 100);
  
      //  // Update the progress bar and input field
      //  updateProgressBar(profileId, progressPercentage);
  
      //   const chapterInput = document.getElementById(`${profileId}-chapter`);
      //  if (chapterInput) chapterInput.value = chapterNumber;

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
  

// Update the visual progress bar (no change from local)
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

// Dynamically generate chapter sections for comments (no change from local)
function generateChapterSections() {
  const chapterContainer = document.getElementById("chapter-comments");
  if (!chapterContainer) {
    console.error("Chapter container not found!");
    return;
  }

  // Clear existing content (if any)
  chapterContainer.innerHTML = "";

  // Create sections for each chapter (no change from local)
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

// Toggle visibility of the comment section for a chapter (no change from local)
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

    //// Save the comment to localStorage with the bookId
    //const savedComments = JSON.parse(localStorage.getItem(`${bookId}-${chapterId}`)) || [];
    //savedComments.push(commentText);
    //localStorage.setItem(`${bookId}-${chapterId}`, JSON.stringify(savedComments));
  
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

    commentInput.value = "";

  }
  

// Load saved comments from Firebase for all chapters
function loadComments() {
    for (let i = 1; i <= numChapters; i++) {
      const chapterId = `chapter${i}`;
      //const savedComments = JSON.parse(localStorage.getItem(`${bookId}-${chapterId}`)) || [];
      //const commentContainer = document.getElementById(`comment-container-${chapterId}`);
      const commentsRef = ref(database, `comments/${bookId}/${chapterId}`);
      const commentContainer = document.getElementById(`comment-container-${chapterId}`);

      //savedComments.forEach((comment) => {
      //  const commentDiv = document.createElement("div");
      //  commentDiv.classList.add("comment");
      //  commentDiv.innerHTML = `<p><strong>You:</strong> ${comment}</p>`;
      //  commentContainer.appendChild(commentDiv);
      //});
  
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
  
