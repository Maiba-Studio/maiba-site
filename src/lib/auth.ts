import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "maiba-session";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

export async function verifyLampPassword(input: string): Promise<boolean> {
  const hash = process.env.LAMP_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(input, hash);
}

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUsername || !passwordHash) return false;

  const usernameMatch = username === expectedUsername;
  const passwordMatch = await bcrypt.compare(password, passwordHash);
  return usernameMatch && passwordMatch;
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
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
