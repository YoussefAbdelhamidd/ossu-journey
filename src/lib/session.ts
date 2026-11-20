import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionUser } from "./auth";

export const getSession = cache(async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
});
