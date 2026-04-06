import express from "express";
import { protect } from "../middlewares/auth-middleware.js";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../controller/auth-controller.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

export default router;
