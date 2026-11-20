import { NextResponse } from "next/server";
import { attachSession, authenticate, jsonError, publicUser, signSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }
    const user = await authenticate(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Those credentials do not match." }, { status: 401 });
    }
    const token = await signSession(user);
    return attachSession(NextResponse.json({ user: publicUser(user) }), token);
  } catch (error) {
    return jsonError(error);
  }
}
