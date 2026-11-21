import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { importPlaylist } from "@/lib/library";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    return NextResponse.json(await importPlaylist(user, id));
  } catch (error) {
    return jsonError(error);
  }
}
