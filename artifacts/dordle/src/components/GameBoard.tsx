import { useEffect, useRef } from "react";
import type { GuessLetter, LetterState } from "@/lib/gameState";

interface GameBoardProps {
  guesses: GuessLetter[][];
  currentGuess: string;
  shakeRow: number | null;
  revealRow?: number | null;
}

function getTileStyle(state: LetterState, revealed: boolean): string {
  if (!revealed) return "bg-card border-2 border-border text-foreground";
  switch (state) {
    case "correct":
      return "bg-[#538d4e] border-2 border-[#538d4e] text-white";
    case "present":
      return "bg-[#b59f3b] border-2 border-[#b59f3b] text-white";
    case "absent":
      return "bg-[#3a3a3c] border-2 border-[#3a3a3c] text-white dark:bg-[#818384] dark:border-[#818384]";
    default:
      return "bg-card border-2 border-border text-foreground";
  }
}

function Tile({ letter, state, revealed, flipDelay, isCurrentRow, isEmpty }: {
  letter: string;
  state: LetterState;
  revealed: boolean;
  flipDelay: number;
  isCurrentRow: boolean;
  isEmpty: boolean;
}) {
  const prevLetter = useRef(letter);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCurrentRow && letter && letter !== prevLetter.current && popRef.current) {
      popRef.current.classList.remove("tile-pop");
      void popRef.current.offsetWidth;
      popRef.current.classList.add("tile-pop");
    }
    prevLetter.current = letter;
  }, [letter, isCurrentRow]);

  const tileClass = getTileStyle(state, revealed);
  const flipStyle = revealed ? {
    animationDelay: `${flipDelay}ms`,
  } : {};

  return (
    <div
      ref={popRef}
      data-testid={`tile-${letter || "empty"}`}
      className={`
        relative w-full aspect-square flex items-center justify-center
        text-2xl font-bold uppercase rounded-sm
        select-none transition-colors
        ${tileClass}
        ${revealed ? "tile-flip" : ""}
        ${!revealed && !isEmpty ? "border-muted-foreground" : ""}
      `}
      style={{ perspective: "250px", ...flipStyle }}
    >
      {letter}
    </div>
  );
}

export default function GameBoard({ guesses, currentGuess, shakeRow, revealRow }: GameBoardProps) {
  const rows = Array(6).fill(null).map((_, rowIdx) => {
    if (rowIdx < guesses.length) {
      return { letters: guesses[rowIdx], isComplete: true, isCurrent: false };
    }
    if (rowIdx === guesses.length) {
      const letters = Array(5).fill(null).map((_, i) => ({
        letter: currentGuess[i] || "",
        state: "empty" as LetterState,
      }));
      return { letters, isComplete: false, isCurrent: true };
    }
    return {
      letters: Array(5).fill({ letter: "", state: "empty" as LetterState }),
      isComplete: false,
      isCurrent: false,
    };
  });

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[280px] mx-auto" data-testid="game-board">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          data-testid={`row-${rowIdx}`}
          className={`grid grid-cols-5 gap-1.5 ${shakeRow === rowIdx ? "row-shake" : ""}`}
        >
          {row.letters.map((cell, colIdx) => (
            <Tile
              key={colIdx}
              letter={cell.letter}
              state={cell.state}
              revealed={row.isComplete}
              flipDelay={colIdx * 100}
              isCurrentRow={row.isCurrent}
              isEmpty={!cell.letter}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
