import { useState } from "react";
import { getShareText } from "@/lib/gameState";
import type { GuessLetter } from "@/lib/gameState";
import { Link } from "wouter";

interface ResultModalProps {
  won: boolean;
  guesses: GuessLetter[][];
  targetWord: string;
  mode: "daily" | "challenge";
  number: number;
  onClose?: () => void;
}

export default function ResultModal({ won, guesses, targetWord, mode, number, onClose }: ResultModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = getShareText(mode, number, guesses, won);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      data-testid="result-modal"
    >
      <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-[320px] modal-bounce shadow-xl text-center">
        {onClose && (
          <button
            data-testid="button-close-modal"
            onClick={onClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <div className="mb-3">
          {won ? (
            <>
              <div className="text-4xl font-bold text-[#538d4e] mb-1">
                {guesses.length === 1 ? "Genius!" :
                 guesses.length === 2 ? "Magnificent!" :
                 guesses.length === 3 ? "Impressive!" :
                 guesses.length === 4 ? "Splendid!" :
                 guesses.length === 5 ? "Great!" : "Phew!"}
              </div>
              <p className="text-sm text-muted-foreground">
                Solved in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-foreground mb-1">Better luck next time</div>
              <p className="text-sm text-muted-foreground">
                The word was <span className="font-bold text-foreground uppercase">{targetWord}</span>
              </p>
            </>
          )}
        </div>

        <div className="font-mono text-lg leading-tight mb-5 tracking-wider" data-testid="share-preview">
          {guesses.map((row, i) => (
            <div key={i}>
              {row.map((g, j) => (
                <span key={j}>
                  {g.state === "correct" ? "🟩" : g.state === "present" ? "🟨" : "⬛"}
                </span>
              ))}
            </div>
          ))}
        </div>

        <button
          data-testid="button-share"
          onClick={handleShare}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm mb-3 hover:opacity-90 transition-opacity active:scale-95"
        >
          {copied ? "Copied to clipboard!" : "Share Results"}
        </button>

        {mode === "daily" && (
          <Link href="/challenge">
            <button
              data-testid="button-play-challenge"
              className="w-full py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
            >
              Play Challenge Words
            </button>
          </Link>
        )}

        {mode === "challenge" && (
          <Link href="/">
            <button
              data-testid="button-play-daily"
              className="w-full py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
            >
              Today's Word
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
