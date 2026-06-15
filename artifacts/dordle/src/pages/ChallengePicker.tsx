import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";

export default function ChallengePicker() {
  const [, setLocation] = useLocation();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 10000) {
      setError("Enter a number between 1 and 10,000");
      return;
    }
    setLocation(`/challenge/${num}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setValue(raw);
    setError("");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid="challenge-picker">
      <Header title="Dordle" subtitle="Challenge Mode" showBack backHref="/" backLabel="Today's Word" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-[400px] w-full mx-auto">
        <div className="w-full text-center mb-8">
          <div className="text-5xl font-bold mb-3 text-primary">#</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Pick a word</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enter any number from 1 to 10,000. Share the number with friends so you can all compete on the same word.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <input
              data-testid="input-challenge-number"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={10000}
              value={value}
              onChange={handleChange}
              placeholder="1 - 10,000"
              className="w-full h-14 text-center text-2xl font-bold border-2 border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {error && (
              <p data-testid="challenge-error" className="text-destructive text-sm text-center mt-2">
                {error}
              </p>
            )}
          </div>

          <button
            data-testid="button-play-challenge-number"
            type="submit"
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity active:scale-95"
          >
            Play Word
          </button>
        </form>

        <div className="mt-8 grid grid-cols-3 gap-3 w-full">
          {[42, 777, 1337, 2048, 5000, 9999].map((n) => (
            <button
              key={n}
              data-testid={`button-quick-${n}`}
              onClick={() => setLocation(`/challenge/${n}`)}
              className="py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted hover:border-primary transition-colors"
            >
              #{n}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Challenge words don't count toward your daily streak. Play them as many times as you like.
        </p>
      </div>
    </div>
  );
}
