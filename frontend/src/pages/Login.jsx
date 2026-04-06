import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { HiMiniArrowRight, HiMiniSparkles } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";

import { API_PATHS } from "../utils/apiPaths";
import { setStoredUser } from "../utils/authStorage";
import axios from "../utils/axiosInstance";

const highlights = [
  "Role-specific interview sessions",
  "Polished AI-generated answers",
  "Downloadable revision sheets",
];

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleForm = (e) => {
    const { name, value } = e.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(API_PATHS.AUTH.LOGIN, form);
      localStorage.setItem("token", res.data.token);
      setStoredUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      });
      toast.success(`Welcome back, ${res.data.name}`);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid email or password";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#fde68a_0%,transparent_25%),radial-gradient(circle_at_bottom_right,#fecdd3_0%,transparent_28%),linear-gradient(180deg,#fffdf7_0%,#f8fafc_55%,#eef2ff_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="hidden rounded-[36px] border border-white/70 bg-white/65 p-8 shadow-[0_30px_90px_-34px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:block"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
            <HiMiniSparkles className="h-4 w-4" />
            NightMarathon
          </div>
          <h1 className="mt-6 text-5xl font-black leading-[0.95] text-slate-950">
            Return to your interview workspace with momentum.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            Continue from where you left off, reopen your saved sessions, and
            keep practicing with a cleaner, faster revision flow.
          </p>

          <div className="mt-8 space-y-4">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <HiMiniArrowRight className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          onSubmit={handleLogin}
          className="w-full rounded-[34px] border border-white/75 bg-white/84 p-8 shadow-[0_30px_90px_-36px_rgba(15,23,42,0.42)] backdrop-blur-xl sm:p-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
            Welcome Back
          </p>
          <h2 className="mt-3 text-4xl font-black text-slate-950">
            Sign in and keep practicing
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Your interview sessions, generated answers, and downloadable prep
            sheets are waiting.
          </p>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                onChange={handleForm}
                value={form.email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                onChange={handleForm}
                value={form.password}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#111827,#1f2937)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Login to Dashboard"}
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Or
            </p>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-amber-600 transition hover:text-amber-700"
            >
              Create one now
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
