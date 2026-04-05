import { BsStars } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";

const GenerateButton = ({ onClick, generating, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={generating || disabled}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#111827,#1f2937)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(15,23,42,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-22px_rgba(15,23,42,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {generating ? (
        <>
          <ImSpinner8 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <BsStars className="h-4 w-4" />
          Generate Questions
        </>
      )}
    </button>
  );
};

export default GenerateButton;
