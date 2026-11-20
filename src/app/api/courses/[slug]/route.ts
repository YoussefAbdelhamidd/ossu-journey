import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { getCourse } from "@/lib/study";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { slug } = await context.params;
    return NextResponse.json(await getCourse(user, slug));
  } catch (error) {
    return jsonError(error);
  }
}
