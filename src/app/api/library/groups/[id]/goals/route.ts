import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { replaceGoals } from "@/lib/library";
import { replaceGoalsSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    const parsed = replaceGoalsSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Goals were not understood." }, { status: 400 });
    }
    return NextResponse.json(await replaceGoals(user, id, parsed.data.goals));
  } catch (error) {
    return jsonError(error);
  }
}
