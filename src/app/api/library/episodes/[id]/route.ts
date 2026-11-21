import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { getEpisodeDetail } from "@/lib/library";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    return NextResponse.json(await getEpisodeDetail(user, id));
  } catch (error) {
    return jsonError(error);
  }
}
