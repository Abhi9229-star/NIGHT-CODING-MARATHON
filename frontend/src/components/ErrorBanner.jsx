import { HiMiniArrowPath, HiMiniExclamationTriangle } from "react-icons/hi2";

const ErrorBanner = ({ message, onRetry }) => (
  <div className="rounded-[28px] border border-rose-200 bg-[linear-gradient(135deg,#fff1f2,#fff7ed)] p-5 shadow-[0_20px_60px_-40px_rgba(225,29,72,0.4)]">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <HiMiniExclamationTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
            Something went wrong
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            Failed to load this session
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-300"
        >
          <HiMiniArrowPath className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  </div>
);

export default ErrorBanner;
