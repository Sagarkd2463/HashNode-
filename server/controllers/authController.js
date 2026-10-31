import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { comparePassword, hashedPassword } from "../utils/password.js";

// Return only public user information
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 80 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 8 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashPassword = await hashedPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User account registered successfully.",
      data: {
        user: publicUser(user),
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Log in an existing user
export const loginUser = async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // check for existing user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user credentials. Please enter valid credentials.",
      });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid password. Please enter correct password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: publicUser(user),
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get the currently logged-in user
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: publicUser(req.user),
    },
  });
};
