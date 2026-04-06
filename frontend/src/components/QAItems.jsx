import { useState } from "react";
import {
  HiMiniChevronDown,
  HiMiniChevronUp,
  HiOutlineShare,
} from "react-icons/hi2";
import { PiPushPin, PiPushPinFill } from "react-icons/pi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const QAItem = ({ item, index, onPin, onShare }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.55)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-34px_rgba(15,23,42,0.65)]">
      <div className="flex items-start justify-between gap-3 px-5 py-5 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex flex-1 items-start gap-4 text-left"
        >
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xs font-bold text-amber-700">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
              {item.question}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {open ? "Tap to collapse answer" : "Tap to reveal answer"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPin?.(item._id)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
              item.isPinned
                ? "border-amber-200 bg-amber-50 text-amber-600"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {item.isPinned ? (
              <PiPushPinFill className="h-5 w-5" />
            ) : (
              <PiPushPin className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onShare?.(item, index)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
          >
            <HiOutlineShare className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
          >
            {open ? (
              <HiMiniChevronUp className="h-5 w-5" />
            ) : (
              <HiMiniChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-6">
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-amber-700 prose-pre:rounded-2xl prose-pre:bg-slate-950 prose-pre:text-slate-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
          </div>
        </div>
      )}
    </article>
  );
};

export default QAItem;
