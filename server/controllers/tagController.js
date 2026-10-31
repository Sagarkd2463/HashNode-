import Tag from "../models/Tag.js";
import Post from "../models/Post.js";
import { slugify } from "../utils/slug.js";

// GET /api/tags
// List all tags and their published post counts
export const listTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ name: 1 }).lean();

    const counts = await Post.aggregate([
      {
        $match: {
          status: "published",
        },
      },
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
          postCount: {
            $sum: 1,
          },
        },
      },
    ]);

    const countByTag = new Map(
      counts.map((item) => [item._id.toString(), item.postCount]),
    );

    const data = tags.map((tag) => ({
      ...tag,
      postCount: countByTag.get(tag._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        tags: data,
        count: data.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tags/:slug/posts
// Get published posts for one tag
export const getPublishedPostsByTag = async (req, res, next) => {
  try {
    const slug = slugify(req.params.slug);

    const tag = await Tag.findOne({ slug });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found.",
      });
    }

    const posts = await Post.find({
      tags: tag._id,
      status: "published",
    })
      .populate("author", "name bio avatarUrl")
      .populate("tags", "name slug")
      .sort({
        publishedAt: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: {
        tag,
        posts,
        count: posts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tags
// Create a new tag
export const createTag = async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required.",
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Tag name cannot exceed 50 characters.",
      });
    }

    const slug = slugify(name);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid tag name.",
      });
    }

    // Check whether the tag already exists
    const existingTag = await Tag.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingTag) {
      return res.status(200).json({
        success: true,
        message: "Tag already exists.",
        data: {
          tag: existingTag,
        },
      });
    }

    const tag = await Tag.create({
      name,
      slug,
    });

    return res.status(201).json({
      success: true,
      message: "Tag created successfully.",
      data: {
        tag,
      },
    });
  } catch (error) {
    next(error);
  }
};
