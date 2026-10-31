import express from "express";
import { createTag, getPublishedPostsByTag, listTags } from "../controllers/tagController.js";

const tagRouter = express.Router();

// Get all tags
tagRouter.get("/", listTags);

// Get published posts for one tag
tagRouter.get("/:slug/posts", getPublishedPostsByTag);

// Create a new tag
tagRouter.post("/", createTag);

export default tagRouter;