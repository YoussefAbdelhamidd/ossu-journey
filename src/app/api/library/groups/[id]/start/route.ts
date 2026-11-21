import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { startGroup } from "@/lib/library";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    const group = await startGroup(user, id);
    return NextResponse.json({
      id: group.id,
      startedAt: group.startedAt?.toISOString() ?? null,
    });
  } catch (error) {
    return jsonError(error);
  }
}
