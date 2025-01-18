const bookId = document.body.getAttribute("data-book-id");
const numChapters = parseInt(document.body.getAttribute("data-num-chapters"), 10);

const binUrl = 'https://api.jsonbin.io/v3/b/678c12b1ad19ca34f8f00034'; // JSONBin URL (replace with your bin ID)
const apiKey = '$2a$10$6dpphzQMUY5a3cxaFMu1ouhZCXIP7nDZTgNRd3lmh9fn1S5CRF5Kq'; // Replace with your API key if necessary

// Fetch data from JSONBin
async function fetchData() {
  try {
    const response = await fetch(binUrl, {
      method: 'GET',
      headers: {
        'X-Master-Key': apiKey, // Include if your bin is private
      }
    });
    const data = await response.json();
    return data.record; // JSONBin wraps your data in `record`
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Save data to JSONBin
async function saveData(updatedData) {
  try {
    const response = await fetch(binUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
      },
      body: JSON.stringify(updatedData)
    });
    const data = await response.json();
    console.log('Data saved to JSONBin:', data);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Load progress and comments when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing...");
  generateChapterSections();
  loadProgress();
  loadComments();
});

// Load progress from JSONBin
async function loadProgress() {
  const currentData = await fetchData();

  document.querySelectorAll(".profile").forEach((profile) => {
    const profileId = profile.querySelector(".profile-circle").id.split("-")[0];
    const chapterNumber = currentData.progress[profileId] || 0;

    const progressPercentage = Math.round((chapterNumber / numChapters) * 100);
    updateProgressBar(profileId, progressPercentage);

    const chapterInput = document.getElementById(`${profileId}-chapter`);
    if (chapterInput) chapterInput.value = chapterNumber;

    console.log(`Loaded progress for ${profileId}: Chapter ${chapterNumber} (${progressPercentage}%).`);
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

// Submit a comment for a chapter and save it to JSONBin
async function submitComment(chapterId) {
  const commentInput = document.getElementById(`comment-input-${chapterId}`);
  const commentText = commentInput.value.trim();

  if (commentText === "") {
    alert("Please enter a valid comment.");
    return;
  }

  const currentData = await fetchData();
  const commentContainer = document.getElementById(`comment-container-${chapterId}`);

  // Add the new comment
  currentData.comments[chapterId] = currentData.comments[chapterId] || [];
  currentData.comments[chapterId].push(commentText);

  // Save the updated data to JSONBin
  saveData(currentData);

  // Display the comment
  const newComment = document.createElement("div");
  newComment.classList.add("comment");
  newComment.innerHTML = `<p><strong>You:</strong> ${commentText}</p>`;
  commentContainer.appendChild(newComment);

  commentInput.value = "";
}

// Load saved comments for all chapters
async function loadComments() {
  const currentData = await fetchData();

  for (let i = 1; i <= numChapters; i++) {
    const chapterId = `chapter${i}`;
    const savedComments = currentData.comments[chapterId] || [];
    const commentContainer = document.getElementById(`comment-container-${chapterId}`);

    savedComments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.classList.add("comment");
      commentDiv.innerHTML = `<p><strong>You:</strong> ${comment}</p>`;
      commentContainer.appendChild(commentDiv);
    });
  }
}


setInterval(loadProgress, 5000); // Refresh progress every 5 seconds
setInterval(loadComments, 5000); // Refresh comments every 5 seconds
