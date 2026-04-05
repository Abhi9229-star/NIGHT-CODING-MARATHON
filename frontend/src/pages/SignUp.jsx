import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { HiMiniCheckBadge, HiMiniSparkles } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";

import { API_PATHS } from "../utils/apiPaths";
import axios from "../utils/axiosInstance";

const reasons = [
  "Create multiple role-based prep sessions",
  "Generate AI questions with detailed answers",
  "Export revision notes for offline practice",
];

const SignUp = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(API_PATHS.AUTH.SIGNUP, form);
      toast.success("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fde68a_0%,transparent_22%),radial-gradient(circle_at_bottom_left,#fed7aa_0%,transparent_24%),linear-gradient(180deg,#fffdf7_0%,#f8fafc_58%,#eff6ff_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.94fr_1.06fr]">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          onSubmit={handleSignup}
          className="w-full rounded-[34px] border border-white/75 bg-white/84 p-8 shadow-[0_30px_90px_-36px_rgba(15,23,42,0.42)] backdrop-blur-xl sm:p-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
            Create Account
          </p>
          <h2 className="mt-3 text-4xl font-black text-slate-950">
            Start building your interview studio
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Sign up once and turn your preparation into a clean, repeatable,
            AI-assisted routine.
          </p>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Full name
              </span>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                onChange={(e) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: e.target.value,
                  }))
                }
                value={form.name}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                onChange={(e) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    email: e.target.value,
                  }))
                }
                value={form.email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                onChange={(e) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    password: e.target.value,
                  }))
                }
                value={form.password}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#111827,#1f2937)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-amber-600 transition hover:text-amber-700"
            >
              Login here
            </Link>
          </p>
        </motion.form>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="hidden rounded-[36px] border border-white/70 bg-white/65 p-8 shadow-[0_30px_90px_-34px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:block"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
            <HiMiniSparkles className="h-4 w-4" />
            New Workspace
          </div>

          <h3 className="mt-6 text-5xl font-black leading-[0.95] text-slate-950">
            Make interview prep feel structured, not chaotic.
          </h3>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            Create an account to organize practice by role, experience, and
            target topics with a more focused workflow from day one.
          </p>

          <div className="mt-8 space-y-4">
            {reasons.map((reason) => (
              <div
                key={reason}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <HiMiniCheckBadge className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">{reason}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SignUp;
