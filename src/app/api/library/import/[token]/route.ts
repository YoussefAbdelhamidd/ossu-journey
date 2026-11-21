import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { importSharedGroup, previewShare } from "@/lib/library";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    requireUser(await sessionFromRequest(request));
    const { token } = await params;
    return NextResponse.json(await previewShare(token));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { token } = await params;
    const clone = await importSharedGroup(user, token);
    return NextResponse.json(clone, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
