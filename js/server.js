const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Set up the homepage route
app.get('/', (req, res) => {
  res.send('Welcome to the WingKink Book Club!');
});

// Connect to MongoDB (or another database)
//mongoose.connect('mongodb://localhost:27017/bookClub', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb://localhost:27017/bookClub')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


// Define schemas and models
const progressSchema = new mongoose.Schema({
  userId: String,
  bookId: String,
  chapter: Number
});

const commentSchema = new mongoose.Schema({
  bookId: String,
  chapter: Number,
  userId: String,
  commentText: String
});

const Progress = mongoose.model('Progress', progressSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API to save progress
app.post('/api/progress', async (req, res) => {
  const { userId, bookId, chapter } = req.body;

  try {
    const existingProgress = await Progress.findOne({ userId, bookId });

    if (existingProgress) {
      existingProgress.chapter = chapter;
      await existingProgress.save();
    } else {
      const newProgress = new Progress({ userId, bookId, chapter });
      await newProgress.save();
    }

    res.status(200).send('Progress updated.');
  } catch (err) {
    res.status(500).send('Error updating progress.');
  }
});

// API to get progress
app.get('/api/progress', async (req, res) => {
  const { userId, bookId } = req.query;

  try {
    const progress = await Progress.findOne({ userId, bookId });

    if (progress) {
      res.status(200).json({ chapter: progress.chapter });
    } else {
      res.status(404).send('No progress found.');
    }
  } catch (err) {
    res.status(500).send('Error fetching progress.');
  }
});

// API to submit a comment
app.post('/api/comments', async (req, res) => {
  const { bookId, chapter, userId, commentText } = req.body;

  try {
    const newComment = new Comment({ bookId, chapter, userId, commentText });
    await newComment.save();
    res.status(200).send('Comment submitted.');
  } catch (err) {
    res.status(500).send('Error submitting comment.');
  }
});

// API to get comments for a chapter
app.get('/api/comments', async (req, res) => {
  const { bookId, chapter } = req.query;

  try {
    const comments = await Comment.find({ bookId, chapter });

    if (comments.length > 0) {
      res.status(200).json(comments);
    } else {
      res.status(404).send('No comments found.');
    }
  } catch (err) {
    res.status(500).send('Error fetching comments.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
