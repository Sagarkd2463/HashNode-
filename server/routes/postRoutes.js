import express from "express";

import {
  createPost,
  deletePost,
  getMyPosts,
  getPostBySlug,
  getPublishedPosts,
  updatePost,
} from "../controllers/postController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const postRouter = express.Router();

// Public routes
postRouter.get("/", getPublishedPosts);

// Protected routes
postRouter.get("/mine", authMiddleware, getMyPosts);

postRouter.post("/", authMiddleware, createPost);

postRouter.put("/:id", authMiddleware, updatePost);

postRouter.delete("/:id", authMiddleware, deletePost);

// Get individual published post by slug
postRouter.get("/:slug", getPostBySlug);

export default postRouter;