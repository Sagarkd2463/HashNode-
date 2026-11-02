import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";

// Return public user information
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

// Get public profile
export const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const posts = await Post.find({
      author: user._id,
      status: "published",
    })
      .populate("tags", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        user: publicUser(user),
        posts,
        count: posts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update logged-in user's profile
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, bio, avatarUrl } = req.body;

    const updates = {};

    // Validate name
    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 80
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 80 characters.",
        });
      }

      updates.name = name.trim();
    }

    // Validate email
    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered.",
        });
      }

      updates.email = normalizedEmail;
    }

    // Validate bio
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: "Bio must be 200 characters or fewer.",
        });
      }

      updates.bio = bio.trim();
    }

    // Validate avatar URL
    if (avatarUrl !== undefined) {
      if (
        typeof avatarUrl !== "string" ||
        (avatarUrl.trim() && !/^https?:\/\/\S+$/i.test(avatarUrl.trim()))
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid avatar URL.",
        });
      }

      updates.avatarUrl = avatarUrl.trim();
    }

    // Check empty updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: publicUser(user),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    next(error);
  }
};