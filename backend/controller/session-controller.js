import mongoose from "mongoose";

import Question from "../models/question-model.js";
import Session from "../models/session-model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createHttpError } from "../utils/http-error.js";

const ensureValidSessionId = (sessionId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw createHttpError(400, "Invalid session id");
  }
};

export const createSession = asyncHandler(async (req, res) => {
  const { role, experience, topicsToFocus, description, questions } = req.body;
  const userId = req.user._id;

  if (!role?.trim() || !experience?.trim()) {
    throw createHttpError(400, "Role and experience are required");
  }

  if (questions && !Array.isArray(questions)) {
    throw createHttpError(400, "Questions must be an array");
  }

  const session = await Session.create({
    user: userId,
    role: role.trim(),
    experience: experience.trim(),
    topicsToFocus: topicsToFocus?.trim() || "",
    description: description?.trim() || "",
  });

  const questionDocs = await Promise.all(
    (questions || []).map(async (questionItem) => {
      const question = await Question.create({
        session: session._id,
        question: questionItem.question,
        answer: questionItem.answer || "",
        note: questionItem.note || "",
        isPinned: questionItem.isPinned || false,
      });

      return question._id;
    }),
  );

  session.questions = questionDocs;
  await session.save();

  const populatedSession = await Session.findById(session._id).populate(
    "questions",
  );

  res.status(201).json({
    success: true,
    session: populatedSession,
  });
});

export const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("questions");

  res.status(200).json({
    success: true,
    count: sessions.length,
    sessions,
  });
});

export const getSessionById = asyncHandler(async (req, res) => {
  ensureValidSessionId(req.params.id);

  const session = await Session.findById(req.params.id)
    .populate("questions")
    .populate("user", "name email");

  if (!session) {
    throw createHttpError(404, "Session not found");
  }

  if (session.user._id.toString() !== req.user._id.toString()) {
    throw createHttpError(403, "Not authorized");
  }

  res.status(200).json({
    success: true,
    session,
  });
});
