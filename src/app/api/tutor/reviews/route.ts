import { NextResponse } from "next/server";
import { jsonError, requireTutor, sessionFromRequest } from "@/lib/auth";
import { getReviewQueue } from "@/lib/study";

export async function GET(request: Request) {
  try {
    requireTutor(await sessionFromRequest(request));
    const filter = new URL(request.url).searchParams.get("filter") === "all" ? "all" : "open";
    return NextResponse.json({ reviews: await getReviewQueue(filter) });
  } catch (error) {
    return jsonError(error);
  }
}
