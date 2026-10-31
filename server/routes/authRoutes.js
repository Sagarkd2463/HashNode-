import express from "express";
import { getMe, loginUser, registerUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);

authRouter.post("/login", loginUser);

authRouter.get("/me", authMiddleware, getMe);

export default authRouter;