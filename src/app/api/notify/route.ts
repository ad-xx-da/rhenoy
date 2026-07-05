import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// On Vercel the project root is read-only; /tmp is the only writable path.
// Locally we write to data/emails.json at the project root so you can inspect it.
const IS_VERCEL = !!process.env.VERCEL;
const FILE = IS_VERCEL
  ? "/tmp/emails.json"
  : path.join(process.cwd(), "data", "emails.json");

function readEmails(): string[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeEmails(emails: string[]) {
  if (!IS_VERCEL) fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(emails, null, 2));
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const emails = readEmails();
  if (!emails.includes(email)) {
    emails.push(email);
    writeEmails(emails);
    console.log("[notify] New signup:", email);
  }
  return NextResponse.json({ ok: true });
}
