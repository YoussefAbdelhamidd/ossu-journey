import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { getLecture } from "@/lib/study";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await context.params;
    return NextResponse.json(await getLecture(user, id));
  } catch (error) {
    return jsonError(error);
  }
}
