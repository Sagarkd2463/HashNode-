import Post from "../models/Post.js";
import Tag from "../models/Tag.js";
import { slugify } from "../utils/slug.js";

// Include author and tag information in post responses
export const populatePost = (query) => {
  return query
    .populate("author", "name bio avatarUrl")
    .populate("tags", "name slug");
};

// Find or create tags
export const getTags = async (tagNames = []) => {
  if (!Array.isArray(tagNames)) {
    throw new Error("Tags must be an array.");
  }

  if (tagNames.some((tag) => typeof tag !== "string")) {
    throw new Error("Each tag must be a string.");
  }

  const names = [
    ...new Set(tagNames.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  ];

  if (names.length > 10) {
    throw new Error("A post can have a maximum of 10 tags.");
  }

  const tagIds = [];

  for (const name of names) {
    if (name.length > 40) {
      throw new Error("Each tag must be 40 characters or fewer.");
    }

    const slug = slugify(name);

    if (!slug) {
      continue;
    }

    let tag = await Tag.findOne({ slug });

    if (!tag) {
      try {
        tag = await Tag.create({ name, slug });
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }

        tag = await Tag.findOne({ slug });
      }
    }

    if (tag && !tagIds.some((id) => id.equals(tag._id))) {
      tagIds.push(tag._id);
    }
  }

  return tagIds;
};

// Generate a unique slug
export const createSlug = async (title, postId = null) => {
  const baseSlug = slugify(title);

  if (!baseSlug) {
    throw new Error("Title must contain letters or numbers.");
  }

  let slug = baseSlug;
  let count = 2;

  while (
    await Post.exists({
      slug,
      ...(postId && { _id: { $ne: postId } }),
    })
  ) {
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
};