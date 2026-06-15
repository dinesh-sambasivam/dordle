import { useState } from "react";
import { useParams } from "wouter";
import { getChallengeWord } from "@/data/challengeWords";
import { useGame } from "@/hooks/useGame";
import Header from "@/components/Header";
import GameBoard from "@/components/GameBoard";
import Keyboard from "@/components/Keyboard";
import ResultModal from "@/components/ResultModal";
import { Link } from "wouter";

export default function ChallengeGame() {
  const params = useParams<{ number: string }>();
  const num = parseInt(params.number || "1", 10);
  const [showResult, setShowResult] = useState(false);

  if (isNaN(num) || num < 1 || num > 10000) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <p className="text-xl font-bold text-foreground mb-2">Invalid challenge number</p>
        <p className="text-muted-foreground mb-6 text-sm">Please enter a number between 1 and 10,000</p>
        <Link href="/challenge">
          <button
            data-testid="button-back-to-challenge"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
          >
            Pick a number
          </button>
        </Link>
      </div>
    );
  }

  const targetWord = getChallengeWord(num);
  if (!targetWord) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <p className="text-xl font-bold text-foreground mb-4">Word not found</p>
        <Link href="/challenge">
          <button
            data-testid="button-back-challenge"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
          >
            Pick another number
          </button>
        </Link>
      </div>
    );
  }

  return <ChallengeGameInner num={num} targetWord={targetWord} showResult={showResult} setShowResult={setShowResult} />;
}

function ChallengeGameInner({
  num,
  targetWord,
  showResult,
  setShowResult,
}: {
  num: number;
  targetWord: string;
  showResult: boolean;
  setShowResult: (v: boolean) => void;
}) {
  const { guesses, currentGuess, gameOver, won, keyboardState, shakeRow, invalidWordMessage, onKeyPress } =
    useGame(targetWord, "challenge", undefined, num);

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid="challenge-game">
      <Header
        title="Dordle"
        subtitle={`Challenge #${num}`}
        showBack
        backHref="/challenge"
        backLabel="All Challenges"
      />

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
            onClick={() => setShowResult(true)}
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
          mode="challenge"
          number={num}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
