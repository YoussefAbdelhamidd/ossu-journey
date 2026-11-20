import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { saveAnswer } from "@/lib/study";
import { answerSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const parsed = answerSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Write an answer before saving. Keep it under 20,000 characters." },
        { status: 400 },
      );
    }
    return NextResponse.json(await saveAnswer(user, parsed.data.questionId, parsed.data.body));
  } catch (error) {
    return jsonError(error);
  }
}
