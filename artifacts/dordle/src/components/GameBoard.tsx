import { useEffect, useRef, useState } from "react";
import type { GuessLetter, LetterState } from "@/lib/gameState";

interface GameBoardProps {
  guesses: GuessLetter[][];
  currentGuess: string;
  shakeRow: number | null;
}

const FLIP_STAGGER = 300;  // ms between each tile starting its flip
const FLIP_HALF = 250;     // ms for each half of the flip (total = 500ms)

function getRevealedStyle(state: LetterState): string {
  switch (state) {
    case "correct":
      return "bg-[#538d4e] border-[#538d4e] text-white";
    case "present":
      return "bg-[#b59f3b] border-[#b59f3b] text-white";
    case "absent":
      return "bg-[#3a3a3c] border-[#3a3a3c] text-white dark:bg-[#818384] dark:border-[#818384]";
    default:
      return "bg-card border-border text-foreground";
  }
}

type TilePhase = "pre" | "out" | "in" | "done";

function CompletedRow({ row, animate }: { row: GuessLetter[]; animate: boolean }) {
  // Freeze the animation decision at mount so incidental rerenders cannot
  // cancel a reveal in progress.
  const [shouldAnimate] = useState(animate);
  const [phase, setPhase] = useState<TilePhase[]>(() =>
    row.map(() => (shouldAnimate ? "pre" : "done"))
  );

  useEffect(() => {
    if (!shouldAnimate) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    row.forEach((_, i) => {
      const base = i * FLIP_STAGGER;
      // fold away
      timers.push(setTimeout(() => {
        setPhase((p) => { const n = [...p]; n[i] = "out"; return n; });
      }, base));
      // colour visible, unfold
      timers.push(setTimeout(() => {
        setPhase((p) => { const n = [...p]; n[i] = "in"; return n; });
      }, base + FLIP_HALF));
      // animation class removed, tile stays coloured
      timers.push(setTimeout(() => {
        setPhase((p) => { const n = [...p]; n[i] = "done"; return n; });
      }, base + FLIP_HALF * 2));
    });
    // Safety net
    timers.push(setTimeout(() => {
      setPhase(row.map(() => "done"));
    }, row.length * FLIP_STAGGER + FLIP_HALF * 2 + 100));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAnimate]);

  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
      {row.map((cell, i) => {
        const coloured = phase[i] === "in" || phase[i] === "done";
        return (
          <div
            key={i}
            data-testid={`tile-revealed-${cell.letter}`}
            className={`
              w-full aspect-square flex items-center justify-center
              text-xl sm:text-2xl font-bold uppercase rounded-sm border-2 select-none
              ${coloured ? getRevealedStyle(cell.state) : "bg-card border-border text-foreground"}
              ${phase[i] === "out" ? "tile-flip-out" : ""}
              ${phase[i] === "in" ? "tile-flip-in" : ""}
            `}
          >
            {cell.letter}
          </div>
        );
      })}
    </div>
  );
}

function CurrentRow({ currentGuess, shake }: { currentGuess: string; shake: boolean }) {
  const cells = Array(5)
    .fill(null)
    .map((_, i) => currentGuess[i] || "");

  return (
    <div className={`grid grid-cols-5 gap-1 sm:gap-1.5 ${shake ? "row-shake" : ""}`} data-testid="current-row">
      {cells.map((letter, i) => (
        <CurrentTile key={i} letter={letter} />
      ))}
    </div>
  );
}

function CurrentTile({ letter }: { letter: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef(letter);

  useEffect(() => {
    if (letter && letter !== prev.current && ref.current) {
      ref.current.classList.remove("tile-pop");
      void ref.current.offsetWidth;
      ref.current.classList.add("tile-pop");
    }
    prev.current = letter;
  }, [letter]);

  return (
    <div
      ref={ref}
      data-testid={`tile-current-${letter || "empty"}`}
      className={`
        w-full aspect-square flex items-center justify-center
        text-xl sm:text-2xl font-bold uppercase rounded-sm border-2 select-none
        bg-card text-foreground
        ${letter ? "border-muted-foreground" : "border-border"}
      `}
    >
      {letter}
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            className="w-full aspect-square rounded-sm border-2 border-border bg-card"
          />
        ))}
    </div>
  );
}

export default function GameBoard({ guesses, currentGuess, shakeRow }: GameBoardProps) {
  const prevCount = useRef(guesses.length);
  const animatingRow = guesses.length > prevCount.current ? guesses.length - 1 : -1;

  useEffect(() => {
    prevCount.current = guesses.length;
  }, [guesses.length]);

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 w-full max-w-[240px] sm:max-w-[300px] mx-auto" data-testid="game-board">
      {Array(6)
        .fill(null)
        .map((_, rowIdx) => {
          if (rowIdx < guesses.length) {
            return (
              <CompletedRow
                key={`completed-${rowIdx}`}
                row={guesses[rowIdx]}
                animate={rowIdx === animatingRow}
              />
            );
          }
          if (rowIdx === guesses.length) {
            return (
              <CurrentRow
                key="current"
                currentGuess={currentGuess}
                shake={shakeRow === rowIdx}
              />
            );
          }
          return <EmptyRow key={`empty-${rowIdx}`} />;
        })}
    </div>
  );
}
