import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import {
  generateInterviewQuestions,
  explainConcept,
} from "../controller/ai-controller.js";

const router = express.Router();

router.post("/generate-questions", protect, generateInterviewQuestions);
router.post("/generate-explanation", protect, explainConcept);

export default router;