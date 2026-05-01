import { NextRequest, NextResponse } from "next/server";
import {
  getClientIp,
  hasValidOrigin,
  invalidOriginResponse,
  rateLimit,
  rateLimitResponse,
} from "@/lib/request-security";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY || "";
const GOOGLE_FORM_URL = process.env.GOOGLE_FORM_URL || "";
const GOOGLE_FORM_NAME_FIELD = process.env.GOOGLE_FORM_NAME_FIELD || "";
const GOOGLE_FORM_EMAIL_FIELD = process.env.GOOGLE_FORM_EMAIL_FIELD || "";
const GOOGLE_FORM_MESSAGE_FIELD = process.env.GOOGLE_FORM_MESSAGE_FIELD || "";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

async function verifyCaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET) return !IS_PRODUCTION;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return data.success && (data.score ?? 1) >= 0.5;
  } catch {
    return false;
  }
}

async function submitToGoogleForm(name: string, email: string, message: string) {
  if (
    !GOOGLE_FORM_URL ||
    !GOOGLE_FORM_NAME_FIELD ||
    !GOOGLE_FORM_EMAIL_FIELD ||
    !GOOGLE_FORM_MESSAGE_FIELD
  ) {
    if (IS_PRODUCTION) throw new Error("Contact form is not configured");
    return;
  }

  const formData = new URLSearchParams();
  formData.append(GOOGLE_FORM_NAME_FIELD, name);
  formData.append(GOOGLE_FORM_EMAIL_FIELD, email);
  formData.append(GOOGLE_FORM_MESSAGE_FIELD, message);

  await fetch(GOOGLE_FORM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    if (!hasValidOrigin(req)) return invalidOriginResponse();

    const ip = getClientIp(req);
    const limited = rateLimit(`contact:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 5,
    });
    if (!limited.ok) return rateLimitResponse(limited.retryAfter);

    const { name, email, message, captchaToken } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if ((RECAPTCHA_SECRET || IS_PRODUCTION) && !captchaToken) {
      return NextResponse.json(
        { error: "Captcha verification required" },
        { status: 400 }
      );
    }

    const captchaValid = await verifyCaptcha(captchaToken || "");
    if (!captchaValid) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 403 }
      );
    }

    await submitToGoogleForm(name, email, message);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/contact error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
