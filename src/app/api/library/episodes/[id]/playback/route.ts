import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { saveEpisodePlayback } from "@/lib/library";
import { playbackSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    const parsed = playbackSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Playback was not understood." }, { status: 400 });
    }
    return NextResponse.json(
      await saveEpisodePlayback(user, id, parsed.data.positionSeconds),
    );
  } catch (error) {
    return jsonError(error);
  }
}
