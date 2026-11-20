import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { saveLectureNote } from "@/lib/study";
import { lectureNoteSchema } from "@/lib/validators";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await context.params;
    const parsed = lectureNoteSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Note was not understood." }, { status: 400 });
    }
    return NextResponse.json(await saveLectureNote(user, id, parsed.data.body));
  } catch (error) {
    return jsonError(error);
  }
}
