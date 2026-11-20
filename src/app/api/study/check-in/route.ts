import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { recordStudy } from "@/lib/study";
import { inMorningWindow } from "@/lib/time";

export async function POST(request: Request) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    await recordStudy(user.id);
    return NextResponse.json({ ok: true, inWindow: inMorningWindow() });
  } catch (error) {
    return jsonError(error);
  }
}
