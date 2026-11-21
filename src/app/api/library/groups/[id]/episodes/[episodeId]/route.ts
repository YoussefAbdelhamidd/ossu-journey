import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { deleteEpisode } from "@/lib/library";

type Params = { params: Promise<{ id: string; episodeId: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id, episodeId } = await params;
    return NextResponse.json(await deleteEpisode(user, id, episodeId));
  } catch (error) {
    return jsonError(error);
  }
}
