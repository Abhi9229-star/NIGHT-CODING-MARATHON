import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiMiniArrowRight, HiMiniSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";

const sessionCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay: index * 0.06 },
  }),
};

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [topicsToFocus, setTopicsToFocus] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(res.data.sessions);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!role || !experience) {
      toast.error("Role and experience are required");
      return;
    }

    try {
      setCreating(true);
      const res = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
        role,
        experience,
        topicsToFocus,
        description,
        questions: [],
      });

      setSessions((currentSessions) => [res.data.session, ...currentSessions]);
      toast.success("Session created");
      setRole("");
      setExperience("");
      setTopicsToFocus("");
      setDescription("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="relative overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#fecdd3_0%,transparent_26%),linear-gradient(180deg,#fffdf7_0%,#f8fafc_65%,#eef2ff_100%)]" />
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] border border-white/70 bg-white/78 px-6 py-8 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                <HiMiniSparkles className="h-4 w-4" />
                Personal workspace
              </div>
              <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
                Build focused interview practice sessions
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Create a role-specific session, define your experience level,
                add your focus topics, and jump straight into a polished
                question workspace.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-5 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{sessions.length}</p>
              <p>Session{sessions.length === 1 ? "" : "s"} in your prep library</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.7fr_1fr_auto]">
            <input
              placeholder="Role (Frontend Developer, MERN Stack, Java Full Stack)"
              value={role}
              className="rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
              onChange={(e) => setRole(e.target.value)}
            />

            <input
              placeholder="Experience (2 years)"
              value={experience}
              className="rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
              onChange={(e) => setExperience(e.target.value)}
            />

            <input
              placeholder="Focus topics (React, DSA, Node, DBMS)"
              value={topicsToFocus}
              className="rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
              onChange={(e) => setTopicsToFocus(e.target.value)}
            />

            <button
              onClick={createSession}
              disabled={creating}
              className="rounded-[22px] bg-[linear-gradient(135deg,#111827,#1f2937)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(15,23,42,0.85)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Session"}
            </button>
          </div>

          <textarea
            placeholder="Add optional context, job description highlights, or weak areas you want to practice."
            value={description}
            className="mt-4 min-h-28 w-full rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            onChange={(e) => setDescription(e.target.value)}
          />
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Session Library
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Your current interview tracks
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center text-slate-500">
              Loading your sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
              <p className="text-xl font-semibold text-slate-900">No sessions yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Create your first session above and your personalized interview
                board will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session, index) => (
                <motion.button
                  type="button"
                  key={session._id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={sessionCardVariants}
                  onClick={() => navigate(`/interview/${session._id}`)}
                  className="group rounded-[28px] border border-white/80 bg-white/82 p-6 text-left shadow-[0_22px_70px_-36px_rgba(15,23,42,0.4)] backdrop-blur transition hover:-translate-y-1.5 hover:shadow-[0_28px_90px_-38px_rgba(15,23,42,0.5)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        {session.experience}
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-slate-950">
                        {session.role}
                      </h3>
                    </div>
                    <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {session.questions?.length || 0} Q
                    </div>
                  </div>

                  {session.topicsToFocus && (
                    <p className="mt-5 text-sm leading-7 text-slate-600">
                      Focus: {session.topicsToFocus}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                    <span>
                      {session.description
                        ? "Includes custom notes"
                        : "Ready for AI generation"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      Open
                      <HiMiniArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
