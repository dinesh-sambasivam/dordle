export type LetterState = "correct" | "present" | "absent" | "empty" | "filled";

export interface GuessLetter {
  letter: string;
  state: LetterState;
}

export interface GameState {
  guesses: GuessLetter[][];
  currentGuess: string;
  gameOver: boolean;
  won: boolean;
  word: string;
  mode: "daily" | "challenge";
  challengeNumber?: number;
  dailyNumber?: number;
}

export type KeyboardState = Record<string, LetterState>;

export function evaluateGuess(guess: string, target: string): GuessLetter[] {
  const result: GuessLetter[] = Array(5).fill(null).map((_, i) => ({
    letter: guess[i],
    state: "absent" as LetterState,
  }));

  const targetArr = target.split("");
  const used = Array(5).fill(false);

  // First pass: correct letters
  for (let i = 0; i < 5; i++) {
    if (guess[i] === targetArr[i]) {
      result[i].state = "correct";
      used[i] = true;
    }
  }

  // Second pass: present letters
  for (let i = 0; i < 5; i++) {
    if (result[i].state === "correct") continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guess[i] === targetArr[j]) {
        result[i].state = "present";
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

export function buildKeyboardState(guesses: GuessLetter[][]): KeyboardState {
  const state: KeyboardState = {};
  const priority: Record<LetterState, number> = {
    correct: 3,
    present: 2,
    absent: 1,
    empty: 0,
    filled: 0,
  };

  for (const guess of guesses) {
    for (const g of guess) {
      const curr = state[g.letter];
      if (!curr || priority[g.state] > priority[curr]) {
        state[g.letter] = g.state;
      }
    }
  }

  return state;
}

export function getShareEmojis(guesses: GuessLetter[][]): string {
  return guesses
    .map((row) =>
      row.map((g) => {
        if (g.state === "correct") return "🟩";
        if (g.state === "present") return "🟨";
        return "⬛";
      }).join("")
    )
    .join("\n");
}

export function getShareText(
  mode: "daily" | "challenge",
  number: number,
  guesses: GuessLetter[][],
  won: boolean
): string {
  const tries = won ? guesses.length : "X";
  const label = mode === "daily" ? `Dordle #${number}` : `Dordle Challenge #${number}`;
  const emojis = getShareEmojis(guesses);
  return `${label} ${tries}/6\n\n${emojis}`;
}
