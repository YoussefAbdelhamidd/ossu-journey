import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { savePlayback } from "@/lib/study";
import { playbackSchema } from "@/lib/validators";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await context.params;
    const parsed = playbackSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Playback was not understood." }, { status: 400 });
    }
    return NextResponse.json(
      await savePlayback(user, id, parsed.data.positionSeconds),
    );
  } catch (error) {
    return jsonError(error);
  }
}
