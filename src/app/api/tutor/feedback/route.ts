import { NextResponse } from "next/server";
import { jsonError, requireTutor, sessionFromRequest } from "@/lib/auth";
import { saveFeedback } from "@/lib/study";
import { feedbackSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const tutor = requireTutor(await sessionFromRequest(request));
    const parsed = feedbackSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Write feedback before sending it." }, { status: 400 });
    }
    return NextResponse.json(await saveFeedback(tutor, parsed.data.answerId, parsed.data.body));
  } catch (error) {
    return jsonError(error);
  }
}
