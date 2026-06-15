import type { GuessLetter } from "./gameState";

export interface DailyProgress {
  dailyNumber: number;
  guesses: GuessLetter[][];
  gameOver: boolean;
  won: boolean;
  date: string;
}

const COOKIE_KEY = "dordle_daily_progress";
const COOKIE_EXPIRY_DAYS = 2;

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  return null;
}

export function saveDailyProgress(progress: DailyProgress): void {
  try {
    setCookie(COOKIE_KEY, JSON.stringify(progress), COOKIE_EXPIRY_DAYS);
  } catch {
    // Silently fail
  }
}

export function loadDailyProgress(dailyNumber: number): DailyProgress | null {
  try {
    const raw = getCookie(COOKIE_KEY);
    if (!raw) return null;
    const progress: DailyProgress = JSON.parse(raw);
    const today = getTodayString();
    // Invalidate if date changed (past midnight)
    if (progress.date !== today) return null;
    // Invalidate if different day number
    if (progress.dailyNumber !== dailyNumber) return null;
    return progress;
  } catch {
    return null;
  }
}

export function clearDailyProgress(): void {
  setCookie(COOKIE_KEY, "", -1);
}
