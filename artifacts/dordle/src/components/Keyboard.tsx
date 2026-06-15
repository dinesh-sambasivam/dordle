import type { KeyboardState, LetterState } from "@/lib/gameState";

interface KeyboardProps {
  keyboardState: KeyboardState;
  onKey: (key: string) => void;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

function getKeyStyle(state: LetterState | undefined): string {
  switch (state) {
    case "correct":
      return "bg-[#538d4e] text-white border-[#538d4e]";
    case "present":
      return "bg-[#b59f3b] text-white border-[#b59f3b]";
    case "absent":
      return "bg-[#3a3a3c] text-white border-[#3a3a3c] dark:bg-[#818384] dark:border-[#818384]";
    default:
      return "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80";
  }
}

function Key({ label, state, onKey, wide }: {
  label: string;
  state: LetterState | undefined;
  onKey: (key: string) => void;
  wide?: boolean;
}) {
  const isSpecial = label === "ENTER" || label === "BACKSPACE";

  return (
    <button
      data-testid={`key-${label.toLowerCase()}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onKey(label);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        onKey(label);
      }}
      className={`
        no-select flex items-center justify-center
        rounded font-bold text-xs uppercase
        border transition-colors active:scale-95
        ${wide ? "flex-[1.5] min-w-0 px-1 h-14" : "flex-1 min-w-0 h-14"}
        ${isSpecial ? "text-[10px]" : "text-sm"}
        ${getKeyStyle(isSpecial ? undefined : state)}
        cursor-pointer touch-manipulation
      `}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {label === "BACKSPACE" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ) : label}
    </button>
  );
}

export default function Keyboard({ keyboardState, onKey }: KeyboardProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto px-1" data-testid="keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center mb-1">
          {row.map((key) => (
            <Key
              key={key}
              label={key}
              state={key.length === 1 ? keyboardState[key] : undefined}
              onKey={onKey}
              wide={key === "ENTER" || key === "BACKSPACE"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
