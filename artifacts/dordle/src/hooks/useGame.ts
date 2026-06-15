import { useState, useEffect, useCallback, useRef } from "react";
import { evaluateGuess, buildKeyboardState, GuessLetter, KeyboardState } from "@/lib/gameState";
import { isValidWord } from "@/data/validWords";
import { saveDailyProgress, loadDailyProgress, DailyProgress } from "@/lib/cookies";

export interface GameState {
  guesses: GuessLetter[][];
  currentGuess: string;
  gameOver: boolean;
  won: boolean;
  keyboardState: KeyboardState;
  shakeRow: number | null;
  invalidWordMessage: string | null;
}

export function useGame(
  targetWord: string,
  mode: "daily" | "challenge",
  dailyNumber?: number,
  challengeNumber?: number
) {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (mode === "daily" && dailyNumber !== undefined) {
      const saved = loadDailyProgress(dailyNumber);
      if (saved && saved.date === new Date().toISOString().split('T')[0]) {
        return {
          guesses: saved.guesses,
          currentGuess: "",
          gameOver: saved.gameOver,
          won: saved.won,
          keyboardState: buildKeyboardState(saved.guesses),
          shakeRow: null,
          invalidWordMessage: null,
        };
      }
    }
    return {
      guesses: [],
      currentGuess: "",
      gameOver: false,
      won: false,
      keyboardState: {},
      shakeRow: null,
      invalidWordMessage: null,
    };
  });

  // Lock input while a submitted row is revealing, matching Wordle behavior and
  // preventing the next guess from interrupting the flip animation.
  const [revealing, setRevealing] = useState(false);
  const prevGuessCount = useRef(gameState.guesses.length);
  const REVEAL_LOCK_MS = 5 * 350 + 600;
  useEffect(() => {
    const count = gameState.guesses.length;
    if (count > prevGuessCount.current) {
      prevGuessCount.current = count;
      setRevealing(true);
      const t = setTimeout(() => setRevealing(false), REVEAL_LOCK_MS);
      return () => clearTimeout(t);
    }
    prevGuessCount.current = count;
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.guesses.length]);

  // Save progress on change
  useEffect(() => {
    if (mode === "daily" && dailyNumber !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      const progress: DailyProgress = {
        dailyNumber,
        guesses: gameState.guesses,
        gameOver: gameState.gameOver,
        won: gameState.won,
        date: today,
      };
      saveDailyProgress(progress);
    }
  }, [gameState.guesses, gameState.gameOver, gameState.won, mode, dailyNumber]);

  const onKeyPress = useCallback((key: string) => {
    if (gameState.gameOver || revealing) return;

    setGameState((prev) => {
      // Clear shake/invalid state
      let shakeRow = null;
      let invalidWordMessage = null;

      if (key === "BACKSPACE") {
        return {
          ...prev,
          currentGuess: prev.currentGuess.slice(0, -1),
          shakeRow,
          invalidWordMessage,
        };
      }

      if (key === "ENTER") {
        if (prev.currentGuess.length !== 5) {
          return { ...prev, shakeRow: prev.guesses.length, invalidWordMessage: "Not enough letters" };
        }

        if (!isValidWord(prev.currentGuess)) {
          return { ...prev, shakeRow: prev.guesses.length, invalidWordMessage: "Not in word list" };
        }

        const evaluation = evaluateGuess(prev.currentGuess.toLowerCase(), targetWord.toLowerCase());
        const newGuesses = [...prev.guesses, evaluation];
        const isWin = prev.currentGuess.toLowerCase() === targetWord.toLowerCase();
        const isGameOver = isWin || newGuesses.length >= 6;

        return {
          ...prev,
          guesses: newGuesses,
          currentGuess: "",
          gameOver: isGameOver,
          won: isWin,
          keyboardState: buildKeyboardState(newGuesses),
          shakeRow: null,
          invalidWordMessage: null,
        };
      }

      if (/^[A-Z]$/.test(key) && prev.currentGuess.length < 5) {
        return {
          ...prev,
          currentGuess: prev.currentGuess + key,
          shakeRow,
          invalidWordMessage,
        };
      }

      return prev;
    });
  }, [gameState.gameOver, revealing, targetWord]);

  // Handle hardware keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE") {
        onKeyPress(key);
      } else if (/^[A-Z]$/.test(key)) {
        onKeyPress(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress]);

  return {
    ...gameState,
    onKeyPress,
  };
}
