import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  HiMiniArrowDownTray,
  HiMiniBookmark,
  HiMiniSparkles,
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

  const pinnedCount = useMemo(
    () => questions.filter((question) => question.isPinned).length,
    [questions],
  );

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
              onClick={handleDownload}
              disabled={!questions.length}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiMiniArrowDownTray className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </section>

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
                      <QAItem item={question} index={index} onPin={pinQuestion} />
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
