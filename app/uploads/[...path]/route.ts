import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CONTENT_DIR } from "@/lib/content";

const UPLOADS = path.join(CONTENT_DIR, "uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  if (!parts || parts.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }
  const rel = path.join(...parts);
  const file = path.resolve(UPLOADS, rel);
  if (!file.startsWith(UPLOADS)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    const data = await fs.promises.readFile(file);
    const ext = path.extname(file).toLowerCase();
    return new NextResponse(data, {
      headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
