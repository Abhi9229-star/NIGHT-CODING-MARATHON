// session role -> mern full stack, java full stack ,frontend
// exp => 2, 1, 10
// userId => this will store ref

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    topicsToFocus: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true },
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
