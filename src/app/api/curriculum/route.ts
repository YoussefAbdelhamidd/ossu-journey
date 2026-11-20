import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { getCurriculum } from "@/lib/study";

export async function GET(request: Request) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    return NextResponse.json(await getCurriculum(user));
  } catch (error) {
    return jsonError(error);
  }
}
