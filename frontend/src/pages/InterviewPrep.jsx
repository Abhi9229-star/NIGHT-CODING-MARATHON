import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  HiMiniArrowDownTray,
  HiMiniArrowPath,
  HiMiniBookmark,
  HiMiniCheckCircle,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniClipboardDocumentList,
  HiMiniEnvelope,
  HiMiniShare,
  HiMiniSparkles,
  HiMiniUserCircle,
} from "react-icons/hi2";
import { useParams } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import GenerateButton from "../components/GenerateButton";
import QAItem from "../components/QAItems";
import SkeletonCard from "../components/SkeletonCard";
import { API_PATHS } from "../utils/apiPaths";
import axios from "../utils/axiosInstance";

const MotionDiv = motion.div;

const parseError = (err) => {
  if (err.response) {
    return (
      err.response.data?.error ||
      err.response.data?.message ||
      `Server error: ${err.response.status}`
    );
  }

  if (err.request) {
    return "Cannot reach server. Check your connection.";
  }

  return err.message || "Something went wrong.";
};

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripMarkdown = (value = "") =>
  value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#>*_\-\[\]]/g, " ")
    .replace(/\((https?:\/\/.*?)\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const buildAnswerSnippet = (answer = "") => {
  const plainText = stripMarkdown(answer);

  if (!plainText) {
    return "Review the full explanation in the answer panel.";
  }

  const firstChunk = plainText.split(/[.!?]/).find(Boolean)?.trim() || plainText;
  return firstChunk.length > 120 ? `${firstChunk.slice(0, 117)}...` : firstChunk;
};

const shuffle = (items) => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
};

const buildPdfMarkup = (session, questions) => {
  const cards = questions
    .map(
      (question, index) => `
        <section class="question-card">
          <div class="question-index">${String(index + 1).padStart(2, "0")}</div>
          <h2>${escapeHtml(question.question)}</h2>
          <div class="answer">${escapeHtml(
            question.answer || "No answer available.",
          ).replace(/\n/g, "<br />")}</div>
        </section>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(session?.role || "Interview Questions")} PDF</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, sans-serif;
            background: #fffdf8;
            color: #0f172a;
          }
          .sheet {
            max-width: 900px;
            margin: 0 auto;
          }
          .hero {
            border: 1px solid #fde68a;
            border-radius: 24px;
            padding: 28px;
            background: linear-gradient(135deg, #fff7ed, #ffffff);
            margin-bottom: 28px;
          }
          .eyebrow {
            margin: 0 0 10px;
            color: #d97706;
            font-size: 12px;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            font-weight: bold;
          }
          h1 {
            margin: 0;
            font-size: 32px;
            line-height: 1.1;
          }
          .meta {
            margin-top: 14px;
            color: #475569;
            line-height: 1.7;
            font-size: 14px;
          }
          .stats {
            display: inline-block;
            margin-top: 18px;
            padding: 10px 16px;
            border-radius: 999px;
            background: #111827;
            color: white;
            font-size: 13px;
            font-weight: bold;
          }
          .question-card {
            position: relative;
            border: 1px solid #e2e8f0;
            border-radius: 22px;
            padding: 26px;
            background: white;
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .question-index {
            display: inline-block;
            padding: 7px 12px;
            border-radius: 999px;
            background: #fff7ed;
            color: #b45309;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 14px;
          }
          h2 {
            margin: 0 0 14px;
            font-size: 21px;
            line-height: 1.35;
          }
          .answer {
            color: #334155;
            line-height: 1.8;
            font-size: 14px;
            white-space: normal;
          }
          @media print {
            body {
              padding: 0;
              background: white;
            }
            .hero,
            .question-card {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <section class="hero">
            <p class="eyebrow">NightMarathon Interview Prep</p>
            <h1>${escapeHtml(session?.role || "Interview Questions")}</h1>
            <div class="meta">
              <div><strong>Experience:</strong> ${escapeHtml(
                session?.experience || "N/A",
              )}</div>
              <div><strong>Topics:</strong> ${escapeHtml(
                session?.topicsToFocus || "General",
              )}</div>
              <div><strong>Description:</strong> ${escapeHtml(
                session?.description || "N/A",
              )}</div>
            </div>
            <div class="stats">${questions.length} Questions</div>
          </section>
          ${cards}
        </main>
      </body>
    </html>
  `;
};

const InterviewPrep = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const pinnedCount = useMemo(
    () => questions.filter((question) => question.isPinned).length,
    [questions],
  );

  const quizItems = useMemo(() => {
    if (questions.length < 2) {
      return [];
    }

    return questions.map((question) => {
      const correctAnswer = buildAnswerSnippet(question.answer);
      const distractors = shuffle(
        questions
          .filter((candidate) => candidate._id !== question._id)
          .map((candidate) => buildAnswerSnippet(candidate.answer))
          .filter((candidate) => candidate && candidate !== correctAnswer),
      ).slice(0, 3);

      return {
        id: question._id,
        question: question.question,
        answer: question.answer,
        correctAnswer,
        options: shuffle([correctAnswer, ...distractors]),
      };
    });
  }, [questions]);

  const currentQuizItem = quizItems[quizIndex];
  const answeredCount = Object.keys(quizAnswers).length;
  const quizScore = quizItems.filter(
    (item) => quizAnswers[item.id] === item.correctAnswer,
  ).length;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await axios.get(`${API_PATHS.SESSION.GET_ONE}/${id}`);
      setSession(res.data.session);
      setQuestions(res.data.session.questions || []);
    } catch (err) {
      setFetchError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setQuizStarted(false);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [questions]);

  const pinQuestion = (questionId) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question._id === questionId
          ? { ...question, isPinned: !question.isPinned }
          : question,
      ),
    );
  };

  const generateQuestions = async () => {
    setGenerating(true);

    try {
      const response = await axios.post(API_PATHS.AI.GENERATE_QUESTIONS, {
        sessionId: id,
      });

      if (response.data?.data) {
        setQuestions(response.data.data);
      } else {
        await fetchQuestions();
      }

      if (response.data?.reused) {
        toast.success("Existing questions loaded");
      } else {
        toast.success("Questions generated!");
      }
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setGenerating(false);
    }
  };

  const shareText = async (title, text) => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      } else {
        toast.error("Sharing is not supported in this browser");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast.error("Unable to share right now");
      }
    }
  };

  const handleShareQuestion = async (question, index) => {
    const text = [
      `NightMarathon Interview Question ${index + 1}`,
      `Role: ${session?.role || "Interview Prep"}`,
      "",
      `Question: ${question.question}`,
      "",
      `Answer: ${stripMarkdown(question.answer || "No answer available.")}`,
    ].join("\n");

    await shareText(question.question, text);
  };

  const handleShareAllQuestions = async () => {
    if (!questions.length) {
      toast.error("Generate questions before sharing");
      return;
    }

    const text = [
      `NightMarathon Interview Pack`,
      `Role: ${session?.role || "Interview Prep"}`,
      `Experience: ${session?.experience || "N/A"}`,
      `Topics: ${session?.topicsToFocus || "General"}`,
      "",
      ...questions.map(
        (question, index) =>
          `${index + 1}. ${question.question}\nAnswer: ${stripMarkdown(
            question.answer || "No answer available.",
          )}`,
      ),
    ].join("\n\n");

    await shareText(`${session?.role || "Interview"} Questions`, text);
  };

  const startQuiz = () => {
    if (quizItems.length < 2) {
      toast.error("At least 2 questions are needed to start a quiz");
      return;
    }

    setQuizStarted(true);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  };

  const submitQuiz = () => {
    if (answeredCount !== quizItems.length) {
      toast.error("Answer every quiz question before submitting");
      return;
    }

    setQuizSubmitted(true);
    toast.success(`Quiz submitted: ${quizScore}/${quizItems.length}`);
  };

  const handleDownload = () => {
    if (!questions.length) {
      toast.error("Generate questions before downloading");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      toast.error("Allow popups to export this session as PDF");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildPdfMarkup(session, questions));
    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
    };

    toast.success("Print dialog opened. Choose Save as PDF.");
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,transparent_20%),radial-gradient(circle_at_top_right,#fecdd3_0%,transparent_20%),linear-gradient(180deg,#fffdf7_0%,#f8fafc_42%,#eef2ff_100%)]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="rounded-[34px] border border-white/70 bg-white/78 p-6 shadow-[0_28px_90px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                <HiMiniSparkles className="h-4 w-4" />
                Interview session
              </div>
              <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
                {session?.role || "Interview Questions"}
              </h1>
              {session && (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {session.experience} experience
                  {session.topicsToFocus ? ` | Focus: ${session.topicsToFocus}` : ""}
                  {session.description ? ` | ${session.description}` : ""}
                </p>
              )}
              {session?.user && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                    <HiMiniUserCircle className="h-4 w-4 text-amber-600" />
                    {session.user.name}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                    <HiMiniEnvelope className="h-4 w-4 text-amber-600" />
                    {session.user.email}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Total
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {questions.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Pinned
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {pinnedCount}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {questions.length ? "Ready to revise" : "Awaiting generation"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <GenerateButton
              onClick={generateQuestions}
              generating={generating}
              disabled={loading || generating}
            />
            <button
              type="button"
              onClick={handleShareAllQuestions}
              disabled={!questions.length}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiMiniShare className="h-4 w-4" />
              Share Questions
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!questions.length}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiMiniArrowDownTray className="h-4 w-4" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={startQuiz}
              disabled={questions.length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#111827,#1f2937)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiMiniClipboardDocumentList className="h-4 w-4" />
              Start Quiz Test
            </button>
          </div>
        </section>

        {quizStarted && currentQuizItem && (
          <section className="mt-8 rounded-[34px] border border-white/70 bg-white/82 p-6 shadow-[0_28px_90px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                  Quiz Test
                </p>
                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  Check what you remember without opening every answer.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Pick the best answer summary for each question. Once you submit,
                  the correct answer and your final score will be shown.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Progress
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-950">
                    {quizIndex + 1} / {quizItems.length}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Answered
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-950">
                    {answeredCount} / {quizItems.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Question {quizIndex + 1}
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-slate-950">
                    {currentQuizItem.question}
                  </h3>
                </div>

                {quizSubmitted && (
                  <div
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      quizAnswers[currentQuizItem.id] === currentQuizItem.correctAnswer
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {quizAnswers[currentQuizItem.id] === currentQuizItem.correctAnswer
                      ? "Correct"
                      : "Review"}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {currentQuizItem.options.map((option, optionIndex) => {
                  const selected = quizAnswers[currentQuizItem.id] === option;
                  const isCorrect = option === currentQuizItem.correctAnswer;

                  return (
                    <button
                      key={`${currentQuizItem.id}-${optionIndex}`}
                      type="button"
                      disabled={quizSubmitted}
                      onClick={() => handleQuizAnswer(currentQuizItem.id, option)}
                      className={`w-full rounded-[22px] border px-4 py-4 text-left text-sm transition ${
                        quizSubmitted
                          ? isCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : selected
                              ? "border-rose-300 bg-rose-50 text-rose-900"
                              : "border-slate-200 bg-white text-slate-600"
                          : selected
                            ? "border-amber-300 bg-amber-50 text-slate-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <div className="mt-6 rounded-[24px] border border-emerald-100 bg-white px-5 py-5">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <HiMiniCheckCircle className="h-5 w-5" />
                    <p className="font-semibold">Correct answer details</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {currentQuizItem.answer}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setQuizIndex((current) => Math.max(current - 1, 0))}
                    disabled={quizIndex === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HiMiniChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuizIndex((current) =>
                        Math.min(current + 1, quizItems.length - 1),
                      )
                    }
                    disabled={quizIndex === quizItems.length - 1}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <HiMiniChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={startQuiz}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    <HiMiniArrowPath className="h-4 w-4" />
                    Restart Quiz
                  </button>
                  {!quizSubmitted && (
                    <button
                      type="button"
                      onClick={submitQuiz}
                      className="rounded-full bg-[linear-gradient(135deg,#111827,#1f2937)] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>

              {quizSubmitted && (
                <div className="mt-6 rounded-[24px] bg-slate-950 px-5 py-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Final Score
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {quizScore} / {quizItems.length}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Use the review result to revisit the answers you missed and
                    then rerun the quiz.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : fetchError ? (
            <ErrorBanner message={fetchError} onRetry={fetchQuestions} />
          ) : questions.length === 0 ? (
            <EmptyState onGenerate={generateQuestions} generating={generating} />
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                <HiMiniBookmark className="h-4 w-4 text-amber-500" />
                Tap a card to open the answer and pin the important ones for
                revision.
              </div>
              <AnimatePresence>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <MotionDiv
                      key={question._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                    >
                      <QAItem
                        item={question}
                        index={index}
                        onPin={pinQuestion}
                        onShare={handleShareQuestion}
                      />
                    </MotionDiv>
                  ))}
                </div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
