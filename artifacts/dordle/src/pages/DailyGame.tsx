import { useState, useEffect, useRef } from "react";
import { getDailyWord, getDailyNumber, getTodayDateLabel } from "@/data/dailyWords";
import { useGame } from "@/hooks/useGame";
import Header from "@/components/Header";
import GameBoard from "@/components/GameBoard";
import Keyboard from "@/components/Keyboard";
import ResultModal from "@/components/ResultModal";

export default function DailyGame() {
  const targetWord = getDailyWord();
  const dailyNumber = getDailyNumber();
  const dateLabel = getTodayDateLabel();
  const [showResult, setShowResult] = useState(false);

  const { guesses, currentGuess, gameOver, won, keyboardState, shakeRow, invalidWordMessage, onKeyPress } =
    useGame(targetWord, "daily", dailyNumber);

  const mountedOver = useRef(gameOver);
  useEffect(() => {
    if (!gameOver) return;
    const delay = mountedOver.current ? 0 : 1900;
    const t = setTimeout(() => setShowResult(true), delay);
    return () => clearTimeout(t);
  }, [gameOver]);

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-background" data-testid="daily-game">
      <Header subtitle="Word of the Day" />

      <div className="max-w-[400px] w-full mx-auto px-4 pt-2 pb-0 text-center shrink-0">
        <p className="text-sm font-semibold text-foreground" data-testid="text-date">{dateLabel}</p>
        <p className="text-xs text-muted-foreground" data-testid="text-puzzle-number">Dordle #{dailyNumber}</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 px-2 max-w-[400px] w-full mx-auto">
        {invalidWordMessage && (
          <div
            data-testid="invalid-word-message"
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-full z-40 shadow-md"
          >
            {invalidWordMessage}
          </div>
        )}

        <GameBoard
          guesses={guesses}
          currentGuess={currentGuess}
          shakeRow={shakeRow}
        />

        {gameOver && !showResult && (
          <button
            data-testid="button-show-result"
            onClick={() => setShowResult(true)}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            See Results
          </button>
        )}

        <div className="w-full">
          <Keyboard keyboardState={keyboardState} onKey={onKeyPress} />
        </div>
      </div>

      {showResult && (
        <ResultModal
          won={won}
          guesses={guesses}
          targetWord={targetWord}
          mode="daily"
          number={dailyNumber}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
