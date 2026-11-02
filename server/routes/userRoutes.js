import express from "express";

import {
  getPublicProfile,
  updateMyProfile,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Get public user profile
userRouter.get("/:id", getPublicProfile);

// Update logged-in user's profile
userRouter.put("/me", authMiddleware, updateMyProfile);

export default userRouter;
