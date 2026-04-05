import { ImSpinner8 } from "react-icons/im";
import { HiMiniSparkles } from "react-icons/hi2";

const EmptyState = ({ onGenerate, generating }) => (
  <div className="rounded-[30px] border border-white/70 bg-white/78 px-6 py-16 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#fde68a,#fb7185)] text-white shadow-[0_18px_40px_-20px_rgba(244,114,182,0.65)]">
      <HiMiniSparkles className="h-7 w-7" />
    </div>
    <h3 className="mt-5 text-2xl font-bold text-slate-950">
      No questions generated yet
    </h3>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
      Start the session with a fresh AI-generated question set tailored to this
      role, experience level, and your focus topics.
    </p>
    <button
      onClick={onGenerate}
      disabled={generating}
      className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#111827,#1f2937)] px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {generating ? (
        <>
          <ImSpinner8 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <HiMiniSparkles className="h-4 w-4" />
          Generate Questions
        </>
      )}
    </button>
  </div>
);

export default EmptyState;
