import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { saveEpisodeNote } from "@/lib/library";
import { lectureNoteSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    const parsed = lectureNoteSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Note was not understood." }, { status: 400 });
    }
    return NextResponse.json(await saveEpisodeNote(user, id, parsed.data.body));
  } catch (error) {
    return jsonError(error);
  }
}
