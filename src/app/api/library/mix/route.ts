import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { setContentMix } from "@/lib/library";
import { contentMixSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const parsed = contentMixSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Mix data was not understood." }, { status: 400 });
    }
    return NextResponse.json(await setContentMix(user, parsed.data.mix));
  } catch (error) {
    return jsonError(error);
  }
}
