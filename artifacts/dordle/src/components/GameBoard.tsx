import { useEffect, useRef, useState } from "react";
import type { GuessLetter, LetterState } from "@/lib/gameState";

interface GameBoardProps {
  guesses: GuessLetter[][];
  currentGuess: string;
  shakeRow: number | null;
}

const FLIP_STAGGER = 350;
const FLIP_DURATION = 600;

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

function CompletedRow({ row, animate }: { row: GuessLetter[]; animate: boolean }) {
  // Freeze the animation decision at mount so incidental rerenders that flip
  // `animate` to false cannot cancel a reveal in progress.
  const [shouldAnimate] = useState(animate);
  const [colorShown, setColorShown] = useState<boolean[]>(() => row.map(() => !shouldAnimate));

  useEffect(() => {
    if (!shouldAnimate) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    row.forEach((_, i) => {
      const t = setTimeout(() => {
        setColorShown((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * FLIP_STAGGER + FLIP_DURATION / 2);
      timers.push(t);
    });
    // Safety net: ensure every tile is revealed once the full sequence elapses,
    // even if a timer is interrupted.
    const finalTimer = setTimeout(() => {
      setColorShown(row.map(() => true));
    }, row.length * FLIP_STAGGER + FLIP_DURATION);
    timers.push(finalTimer);
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAnimate]);

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {row.map((cell, i) => (
        <div
          key={i}
          data-testid={`tile-revealed-${cell.letter}`}
          className={`
            w-full aspect-square flex items-center justify-center
            text-2xl font-bold uppercase rounded-sm border-2 select-none
            ${colorShown[i] ? getRevealedStyle(cell.state) : "bg-card border-border text-foreground"}
            ${animate ? "tile-flip" : ""}
          `}
          style={animate ? { animationDelay: `${i * FLIP_STAGGER}ms`, animationDuration: `${FLIP_DURATION}ms` } : {}}
        >
          {cell.letter}
        </div>
      ))}
    </div>
  );
}

function CurrentRow({ currentGuess, shake }: { currentGuess: string; shake: boolean }) {
  const cells = Array(5)
    .fill(null)
    .map((_, i) => currentGuess[i] || "");

  return (
    <div className={`grid grid-cols-5 gap-1.5 ${shake ? "row-shake" : ""}`} data-testid="current-row">
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
        text-2xl font-bold uppercase rounded-sm border-2 select-none
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
    <div className="grid grid-cols-5 gap-1.5">
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
    <div className="flex flex-col gap-1.5 w-full max-w-[300px] mx-auto" data-testid="game-board">
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
