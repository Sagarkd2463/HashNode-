import mongoose from "mongoose";
import Post from "../models/Post.js";
import Tag from "../models/Tag.js";
import { slugify, makeExcerpt } from "../utils/slug.js";
import { populatePost, getTags, createSlug } from "../utils/helper.js";

// Get all published posts
export const getPublishedPosts = async (req, res, next) => {
  try {
    const filter = { status: "published" };

    if (req.query.search?.trim()) {
      const search = req.query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: search, $options: "i" };
    }

    if (req.query.tag?.trim()) {
      const tag = await Tag.findOne({
        slug: slugify(req.query.tag),
      });

      if (!tag) {
        return res.status(200).json({
          success: true,
          data: { posts: [], count: 0 },
        });
      }

      filter.tags = tag._id;
    }

    const posts = await populatePost(
      Post.find(filter).sort({ publishedAt: -1, createdAt: -1 }),
    );

    return res.status(200).json({
      success: true,
      data: { posts, count: posts.length },
    });
  } catch (error) {
    next(error);
  }
};

// Get a published post by slug
export const getPostBySlug = async (req, res, next) => {
  try {
    const post = await populatePost(
      Post.findOne({
        slug: req.params.slug,
        status: "published",
      }),
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

// Get the logged-in user's posts
export const getMyPosts = async (req, res, next) => {
  try {
    const posts = await populatePost(
      Post.find({ author: req.user._id }).sort({ updatedAt: -1 }),
    );

    return res.status(200).json({
      success: true,
      data: { posts, count: posts.length },
    });
  } catch (error) {
    next(error);
  }
};

// Create a post
export const createPost = async (req, res, next) => {
  try {
    const {
      title,
      content,
      excerpt,
      coverImage = "",
      status = "draft",
      tags = [],
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 180 ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid title and content are required.",
      });
    }

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be draft or published.",
      });
    }

    if (
      typeof coverImage !== "string" ||
      (coverImage.trim() && !/^https?:\/\/\S+$/i.test(coverImage.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Cover image must be a valid HTTP or HTTPS URL.",
      });
    }

    // Validate excerpt only if the user provides it
    if (
      excerpt !== undefined &&
      (typeof excerpt !== "string" || excerpt.trim().length > 250)
    ) {
      return res.status(400).json({
        success: false,
        message: "Excerpt must be 250 characters or fewer.",
      });
    }

    // Generate excerpt automatically if not provided or empty
    const postExcerpt =
      typeof excerpt === "string" && excerpt.trim()
        ? excerpt.trim()
        : makeExcerpt(content);

    const post = await Post.create({
      title: title.trim(),
      slug: await createSlug(title.trim()),
      content,
      excerpt: postExcerpt,
      coverImage: coverImage.trim(),
      status,
      author: req.user._id,
      tags: await getTags(tags),
      publishedAt: status === "published" ? new Date() : null,
    });

    const result = await populatePost(Post.findById(post._id));

    return res.status(201).json({
      success: true,
      message: "Post created successfully.",
      data: { post: result },
    });
  } catch (error) {
    next(error);
  }
};

// Update a post
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts.",
      });
    }

    const { title, content, excerpt, coverImage, status, tags } = req.body;

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Title must be between 1 and 180 characters.",
        });
      }

      post.title = title.trim();
      post.slug = await createSlug(post.title, post._id);
    }

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Content cannot be empty.",
        });
      }

      post.content = content;
    }

    // Update excerpt if explicitly provided
    if (excerpt !== undefined) {
      if (typeof excerpt !== "string" || excerpt.trim().length > 250) {
        return res.status(400).json({
          success: false,
          message: "Excerpt must be 250 characters or fewer.",
        });
      }

      post.excerpt = excerpt.trim()
        ? excerpt.trim()
        : makeExcerpt(post.content);
    }
    // Automatically regenerate excerpt when content changes
    else if (content !== undefined) {
      post.excerpt = makeExcerpt(post.content);
    }

    if (coverImage !== undefined) {
      if (
        typeof coverImage !== "string" ||
        (coverImage.trim() && !/^https?:\/\/\S+$/i.test(coverImage.trim()))
      ) {
        return res.status(400).json({
          success: false,
          message: "Cover image must be a valid HTTP or HTTPS URL.",
        });
      }

      post.coverImage = coverImage.trim();
    }

    if (status !== undefined) {
      if (!["draft", "published"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be draft or published.",
        });
      }

      if (status === "draft") {
        post.publishedAt = null;
      } else if (post.status !== "published") {
        post.publishedAt = new Date();
      }

      post.status = status;
    }

    if (tags !== undefined) {
      post.tags = await getTags(tags);
    }

    await post.save();

    const result = await populatePost(Post.findById(post._id));

    return res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      data: { post: result },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a post
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts.",
      });
    }

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
