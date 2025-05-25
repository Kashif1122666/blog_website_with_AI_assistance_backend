import Post from '../models/PostSchema.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



export const createPost = async (req, res) => {
   const title = req.body.title?.trim();
   const content = req.body.content?.trim();
      if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
    try {
    const post = await Post.create({
      title,
      content,
      author: req.user._id, // req.user is set by auth middleware
    });
    res.status(201).json(post);
      } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email') 
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyPosts = async (req, res) => {
  try {

    const posts = await Post.find({ author: req.user._id }).populate('author', 'name email');

    if (!posts.length) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

       const title = req.body.title?.trim();
       const content = req.body.content?.trim();

    if (title) post.title = title;
    if (content) post.content = content;

    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();


    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const generatePostContent = async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required for AI generation' });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt =`Write a short and concise blog post (maximum 4 paragraphs) about: ${title}. Keep it under 300 words.`;

  try {
    const result = await model.generateContent(prompt);

    const response = result.response;
    const generatedContent = response.text();

    if (!generatedContent) {
      return res.status(500).json({ message: "Failed to generate content" });
    }

    const post = await Post.create({
      title: title.trim(),
      content: generatedContent,
      author: req.user._id,
    });

    return res.status(201).json(post);

  } catch (error) {
    console.error("AI generation error:", error);
    return res.status(500).json({ message: "Server error generating content", error: error.message });
  }
};




