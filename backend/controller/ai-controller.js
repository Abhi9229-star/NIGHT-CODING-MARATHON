import dotenv from "dotenv";

import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

import Question from "../models/question-model.js";
import Session from "../models/session-model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createHttpError } from "../utils/http-error.js";
import {
  conceptExplainPrompt,
  questionAnswerPrompt,
} from "../utils/prompts-util.js";

dotenv.config();

const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const cleanJsonResponse = (rawText = "") =>
  rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw createHttpError(500, "Gemini API key is not configured");
  }

  const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
};

const parseJsonPayload = (rawText, type) => {
  const cleanedText = cleanJsonResponse(rawText);

  try {
    return JSON.parse(cleanedText);
  } catch {
    const fallbackPattern =
      type === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
    const match = cleanedText.match(fallbackPattern);

    if (!match) {
      throw createHttpError(502, "AI returned invalid JSON", cleanedText);
    }

    return JSON.parse(match[0]);
  }
};

const normalizeAiError = (error) => {
  const message = error?.message || "Unexpected AI error";
  const lowered = message.toLowerCase();

  if (error.statusCode) {
    return error;
  }

  if (
    lowered.includes("api key") ||
    lowered.includes("quota") ||
    lowered.includes("rate limit") ||
    lowered.includes("not found for api version") ||
    lowered.includes("503") ||
    lowered.includes("overloaded") ||
    lowered.includes("fetch failed")
  ) {
    return createHttpError(
      502,
      "AI service is currently unavailable",
      message,
    );
  }

  return createHttpError(500, "Failed to process AI request", message);
};

const validateSessionOwnership = async (sessionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw createHttpError(400, "Invalid sessionId");
  }

  const session = await Session.findById(sessionId);

  if (!session) {
    throw createHttpError(404, "Session not found");
  }

  if (session.user.toString() !== userId.toString()) {
    throw createHttpError(403, "Not authorized");
  }

  return session;
};

export const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { sessionId, numberOfQuestions = DEFAULT_QUESTION_COUNT } = req.body;

  if (!sessionId) {
    throw createHttpError(400, "sessionId is required");
  }

  const parsedCount = Number(numberOfQuestions);
  if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 20) {
    throw createHttpError(
      400,
      "numberOfQuestions must be an integer between 1 and 20",
    );
  }

  const session = await validateSessionOwnership(sessionId, req.user._id);

  if (session.questions.length > 0) {
    const populatedSession = await Session.findById(sessionId).populate(
      "questions",
    );

    return res.status(200).json({
      success: true,
      message: "Questions already existed for this session",
      data: populatedSession?.questions || [],
      reused: true,
    });
  }

  try {
    const model = getGeminiModel();
    const prompt = questionAnswerPrompt(
      session.role,
      session.experience,
      session.topicsToFocus,
      parsedCount,
    );

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const parsed = parseJsonPayload(response.text(), "array");

    if (!Array.isArray(parsed)) {
      throw createHttpError(502, "AI returned an unexpected response format");
    }

    const validQuestions = parsed
      .map((item) => ({
        question: item?.question?.trim(),
        answer: item?.answer?.trim() || "",
      }))
      .filter((item) => item.question);

    if (!validQuestions.length) {
      throw createHttpError(502, "AI returned no valid questions");
    }

    const savedQuestions = await Question.insertMany(
      validQuestions.map((item) => ({
        session: session._id,
        question: item.question,
        answer: item.answer,
        note: "",
        isPinned: false,
      })),
    );

    session.questions = savedQuestions.map((question) => question._id);
    await session.save();

    return res.status(201).json({
      success: true,
      message: "Questions generated successfully",
      data: savedQuestions,
      reused: false,
    });
  } catch (error) {
    throw normalizeAiError(error);
  }
});

export const explainConcept = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question?.trim()) {
    throw createHttpError(400, "Question is required");
  }

  try {
    const model = getGeminiModel();
    const prompt = conceptExplainPrompt(question.trim());
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = parseJsonPayload(response.text(), "object");

    if (!explanation?.title || !explanation?.explanation) {
      throw createHttpError(
        502,
        "AI response is missing required explanation fields",
      );
    }

    return res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    throw normalizeAiError(error);
  }
});
