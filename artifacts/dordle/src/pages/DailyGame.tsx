import { useState } from "react";
import { getDailyWord, getDailyNumber } from "@/data/dailyWords";
import { useGame } from "@/hooks/useGame";
import Header from "@/components/Header";
import GameBoard from "@/components/GameBoard";
import Keyboard from "@/components/Keyboard";
import ResultModal from "@/components/ResultModal";

export default function DailyGame() {
  const targetWord = getDailyWord();
  const dailyNumber = getDailyNumber();
  const [showResult, setShowResult] = useState(false);

  const { guesses, currentGuess, gameOver, won, keyboardState, shakeRow, invalidWordMessage, onKeyPress } =
    useGame(targetWord, "daily", dailyNumber);

  const handleShowResult = () => setShowResult(true);

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid="daily-game">
      <Header subtitle={`Dordle #${dailyNumber}`} />

      <div className="flex-1 flex flex-col items-center justify-between py-2 px-2 max-w-[400px] w-full mx-auto">
        {invalidWordMessage && (
          <div
            data-testid="invalid-word-message"
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-full z-40 shadow-md"
          >
            {invalidWordMessage}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center w-full py-2">
          <GameBoard
            guesses={guesses}
            currentGuess={currentGuess}
            shakeRow={shakeRow}
          />
        </div>

        {gameOver && !showResult && (
          <button
            data-testid="button-show-result"
            onClick={handleShowResult}
            className="mb-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            See Results
          </button>
        )}

        <div className="w-full pb-2">
          <Keyboard keyboardState={keyboardState} onKey={onKeyPress} />
        </div>
      </div>

      {(showResult || (gameOver && won)) && (
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
