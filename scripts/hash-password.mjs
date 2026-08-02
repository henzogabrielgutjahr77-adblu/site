import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const password = process.argv[2];
if (!password) {
  console.error("Uso: node scripts/hash-password.mjs <senha>");
  process.exit(1);
}

const dir = path.join(process.cwd(), "admin");
fs.mkdirSync(dir, { recursive: true });
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);
const out = `scrypt$${salt.toString("hex")}$${hash.toString("hex")}\n`;
fs.writeFileSync(path.join(dir, "password.hash"), out, { mode: 0o600 });
console.log("admin/password.hash atualizado (modo 600).");
