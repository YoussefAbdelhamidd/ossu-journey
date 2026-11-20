import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ossu_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "LEARNER" | "TUTOR";
  timezone: string;
};

export function authSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (secret) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }
  return new TextEncoder().encode("dev-only-ossu-journey-secret-change-me");
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    timezone: user.timezone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(authSecret());
}

export async function verifySession(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    const role = payload.role;
    if (payload.sub == null || (role !== "LEARNER" && role !== "TUTOR")) return null;
    return {
      id: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role,
      timezone: String(payload.timezone ?? "Africa/Cairo"),
    };
  } catch {
    return null;
  }
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
