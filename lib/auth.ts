import crypto from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

const ADMIN_DIR = path.join(process.cwd(), "admin");
const HASH_FILE = path.join(ADMIN_DIR, "password.hash");
const SECRET_FILE = path.join(ADMIN_DIR, "secret");
const COOKIE_NAME = "adblu_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface Session {
  id: string;
  createdAt: number;
}

const sessions = new Map<string, Session>();
const failed = new Map<string, { count: number; until: number }>();

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

function checkRateLimit(ip: string): boolean {
  const entry = failed.get(ip);
  if (!entry) return true;
  if (Date.now() < entry.until) return false;
  failed.delete(ip);
  return true;
}

function registerFailure(ip: string) {
  const entry = failed.get(ip) ?? { count: 0, until: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) entry.until = Date.now() + LOCKOUT_MS;
  failed.set(ip, entry);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const id = store.get(COOKIE_NAME)?.value;
  if (!id) return false;
  const session = sessions.get(id);
  if (!session) return false;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(id);
    return false;
  }
  return true;
}

export async function attemptLogin(
  ip: string,
  password: string,
): Promise<"ok" | "locked" | "denied"> {
  if (!checkRateLimit(ip)) return "locked";
  if (verifyPassword(password)) {
    failed.delete(ip);
    const store = await cookies();
    const id = crypto.randomBytes(32).toString("hex");
    sessions.set(id, { id, createdAt: Date.now() });
    store.set(COOKIE_NAME, id, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/",
      maxAge: SESSION_TTL_MS / 1000,
    });
    return "ok";
  }
  registerFailure(ip);
  return "denied";
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const id = store.get(COOKIE_NAME)?.value;
  if (id) sessions.delete(id);
  store.delete(COOKIE_NAME);
}

export function ensureSecret(): void {
  getSecret();
}
