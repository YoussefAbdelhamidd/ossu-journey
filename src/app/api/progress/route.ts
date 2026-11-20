import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { setProgress } from "@/lib/study";
import { progressSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const parsed = progressSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Progress update was not understood." }, { status: 400 });
    }
    return NextResponse.json(await setProgress(user, parsed.data));
  } catch (error) {
    return jsonError(error);
  }
}
