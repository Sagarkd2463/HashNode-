import express from "express";
import { getPublicProfile, updateMyProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/:id", getPublicProfile);

userRouter.put("/me", authMiddleware, updateMyProfile);

export default userRouter;