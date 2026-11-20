import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import {
  readCookie,
  SESSION_COOKIE,
  signSession,
  verifySession,
  type SessionUser,
} from "./token";

export { SESSION_COOKIE, signSession, verifySession, readCookie };
export type { SessionUser };

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function publicUser(user: SessionUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    timezone: user.timezone,
  };
}

export async function sessionFromRequest(request: Request): Promise<SessionUser | null> {
  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  return verifySession(token);
}

export function requireUser(user: SessionUser | null): SessionUser {
  if (!user) throw new ApiError(401, "Sign in required.");
  return user;
}

export function requireTutor(user: SessionUser | null): SessionUser {
  const session = requireUser(user);
  if (session.role !== "TUTOR") throw new ApiError(403, "Tutor access required.");
  return session;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function attachSession(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, cookieOptions());
  return response;
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return null;
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) return null;
  if (user.role !== "LEARNER" && user.role !== "TUTOR") return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    timezone: user.timezone,
  };
}
