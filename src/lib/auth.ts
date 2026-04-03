import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getUserByUsername, getLampWords, type UserRole } from "@/lib/data";
import { readJSON, writeJSON } from "@/lib/storage";

const SESSION_COOKIE = "maiba-session";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

interface SessionPayload {
  role: UserRole;
  userId: string;
  username: string;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

export async function verifyLampPassword(
  input: string
): Promise<{ valid: boolean; link?: string }> {
  const hash = process.env.LAMP_PASSWORD_HASH;
  if (hash) {
    const match = await bcrypt.compare(input, hash);
    if (match) return { valid: true, link: "/admin/login" };
  }

  const lampWords = await getLampWords();
  const normalized = input.trim().toLowerCase();
  const found = lampWords.find(
    (w) => w.word.trim().toLowerCase() === normalized
  );
  if (found) return { valid: true, link: found.link };

  return { valid: false };
}

const ADMIN_PW_OVERRIDE_FILE = "admin-password-override.json";

interface AdminPasswordOverride {
  hash: string;
}

export async function getAdminPasswordHash(): Promise<string | null> {
  const override = await readJSON<AdminPasswordOverride | null>(
    ADMIN_PW_OVERRIDE_FILE,
    null
  );
  if (override?.hash) return override.hash;
  return process.env.ADMIN_PASSWORD_HASH || null;
}

export async function setAdminPasswordHash(hash: string): Promise<void> {
  await writeJSON<AdminPasswordOverride>(ADMIN_PW_OVERRIDE_FILE, { hash });
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<{ valid: boolean; role?: UserRole; userId?: string }> {
  const envUsername = process.env.ADMIN_USERNAME;
  const adminHash = await getAdminPasswordHash();
  if (envUsername && adminHash && username === envUsername) {
    const match = await bcrypt.compare(password, adminHash);
    if (match) return { valid: true, role: "admin", userId: "env-admin" };
  }

  const user = await getUserByUsername(username);
  if (user) {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) return { valid: true, role: user.role, userId: user.id };
  }

  return { valid: false };
}

export async function createSession(
  role: UserRole,
  userId: string,
  username: string
): Promise<string> {
  const token = await new SignJWT({
    role,
    userId,
    username,
  } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
  return token;
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      role: (payload.role as UserRole) || "admin",
      userId: (payload.userId as string) || "env-admin",
      username: (payload.username as string) || "",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
