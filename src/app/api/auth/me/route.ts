import { NextResponse } from "next/server";
import { jsonError, publicUser, requireUser, sessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    return jsonError(error);
  }
}
