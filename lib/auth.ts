import crypto from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

const ADMIN_DIR = path.join(process.cwd(), "admin");
const HASH_FILE = path.join(ADMIN_DIR, "password.hash");
const SECRET_FILE = path.join(ADMIN_DIR, "secret");
const STATE_FILE = path.join(ADMIN_DIR, "state.json");
const COOKIE_NAME = "adblu_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface State {
  sessions: Record<string, number>;
  attempts: Record<string, { count: number; until: number }>;
}

function loadState(): State {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")) as Partial<State>;
    return {
      sessions: parsed.sessions ?? {},
      attempts: parsed.attempts ?? {},
    };
  } catch {
    return { sessions: {}, attempts: {} };
  }
}

function saveState(state: State): void {
  fs.mkdirSync(ADMIN_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state), { mode: 0o600 });
}

function getSecret(): string {
  if (fs.existsSync(SECRET_FILE)) {
    return fs.readFileSync(SECRET_FILE, "utf-8").trim();
  }
  fs.mkdirSync(ADMIN_DIR, { recursive: true });
  const secret = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
  return secret;
}

function getHash(): string {
  return fs.readFileSync(HASH_FILE, "utf-8").trim();
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyPassword(password: string): boolean {
  try {
    const [algo, saltHex, hashHex] = getHash().split("$");
    if (algo !== "scrypt" || !saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = crypto.scryptSync(password, salt, expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const id = store.get(COOKIE_NAME)?.value;
  if (!id) return false;
  const state = loadState();
  const createdAt = state.sessions[id];
  if (!createdAt) return false;
  if (Date.now() - createdAt > SESSION_TTL_MS) {
    delete state.sessions[id];
    saveState(state);
    return false;
  }
  return true;
}

export async function attemptLogin(
  ip: string,
  password: string,
): Promise<"ok" | "locked" | "denied"> {
  const state = loadState();
  const attempts = state.attempts[ip] ?? { count: 0, until: 0 };
  if (Date.now() < attempts.until) return "locked";
  if (verifyPassword(password)) {
    delete state.attempts[ip];
    const store = await cookies();
    const id = crypto.randomBytes(32).toString("hex");
    state.sessions[id] = Date.now();
    saveState(state);
    store.set(COOKIE_NAME, id, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/",
      maxAge: SESSION_TTL_MS / 1000,
    });
    return "ok";
  }
  attempts.count += 1;
  if (attempts.count >= MAX_ATTEMPTS) attempts.until = Date.now() + LOCKOUT_MS;
  state.attempts[ip] = attempts;
  saveState(state);
  return "denied";
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const id = store.get(COOKIE_NAME)?.value;
  if (id) {
    const state = loadState();
    delete state.sessions[id];
    saveState(state);
  }
  store.delete(COOKIE_NAME);
}

export function ensureSecret(): void {
  getSecret();
}
