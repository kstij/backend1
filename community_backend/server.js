const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://kshitij:kshitij@vruksham.ldf59.mongodb.net/?retryWrites=true&w=majority&appName=vruksham', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Comment schema
const commentSchema = new mongoose.Schema({
  text: String,
  likes: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
});

// Define Post schema
const postSchema = new mongoose.Schema({
  content: String,
  likes: { type: Number, default: 0 },
  comments: [commentSchema],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

// POST route to create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { content } = req.body;
    const newPost = new Post({ content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
});

// GET route to retrieve all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
});

// POST route to add a comment to a post
app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push({ text });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
});

// POST route to like a post
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.likes += 1; 
    await post.save(); 
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error });
  }
});

// POST route to like a comment
app.post('/api/posts/:postId/comment/:commentId/like', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    comment.likes += 1; 
    comment.liked = true; 
    await post.save(); 
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking comment', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
