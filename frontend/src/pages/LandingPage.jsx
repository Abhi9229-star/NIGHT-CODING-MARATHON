import { motion } from "framer-motion";
import { BsStars } from "react-icons/bs";
import {
  HiArrowTrendingUp,
  HiMiniBolt,
  HiMiniDocumentArrowDown,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: HiMiniBolt,
    title: "Fast AI question sets",
    description:
      "Generate role-specific interview questions in seconds instead of collecting them manually.",
  },
  {
    icon: HiArrowTrendingUp,
    title: "Focused practice flow",
    description:
      "Create sessions by role, experience, and target topics so revision stays intentional.",
  },
  {
    icon: HiMiniDocumentArrowDown,
    title: "Download-ready prep",
    description:
      "Export your interview questions and answers into a clean document when you want offline revision.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#fde68a_0%,transparent_30%),radial-gradient(circle_at_top_right,#fecdd3_0%,transparent_28%),linear-gradient(180deg,#fffdf7_0%,#f8fafc_52%,#eef2ff_100%)]" />
      <div className="absolute -left-16 top-28 -z-10 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="absolute -right-12 top-16 -z-10 h-64 w-64 rounded-full bg-rose-200/35 blur-3xl" />

      <section className="mx-auto grid min-h-[calc(100vh-81px)] max-w-6xl items-center gap-14 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
            <BsStars className="h-4 w-4 text-amber-500" />
            Turn interview prep into a repeatable system
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] text-slate-950 sm:text-6xl">
            Practice smarter with an
            <span className="block bg-[linear-gradient(135deg,#f59e0b,#f97316,#fb7185)] bg-clip-text text-transparent">
              interactive AI interview workspace
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Build targeted sessions, generate tailored questions, read polished
            answers, and download your prep kit when you are ready to revise
            offline.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-full bg-[linear-gradient(135deg,#111827,#1f2937)] px-7 py-4 text-sm font-semibold text-white shadow-[0_24px_50px_-24px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5"
            >
              Build Your First Session
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-full border border-slate-200 bg-white/80 px-7 py-4 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
            >
              Continue Practicing
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-[36px] bg-[linear-gradient(135deg,rgba(251,191,36,0.34),rgba(244,114,182,0.22))] blur-2xl" />
          <div className="relative rounded-[36px] border border-white/70 bg-white/82 p-5 shadow-[0_30px_80px_-32px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="rounded-[28px] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                    Live Session
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">Frontend Engineer</h2>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Ready to practice
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Explain React rendering and reconciliation.",
                  "What is event bubbling and how do you control it?",
                  "How would you optimize a large list UI?",
                ].map((question, index) => (
                  <div
                    key={question}
                    className="rounded-2xl border border-white/8 bg-white/6 px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                      Prompt {index + 1}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-100">
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-3xl border border-slate-200/80 bg-white/80 p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
