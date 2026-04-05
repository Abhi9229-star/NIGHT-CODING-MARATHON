import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: "" },
    note: { type: String, default: "" },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
