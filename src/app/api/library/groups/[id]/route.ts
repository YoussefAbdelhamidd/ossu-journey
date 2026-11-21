import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { deleteGroup, getGroupDetail, updateGroup } from "@/lib/library";
import { updateLibraryGroupSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    return NextResponse.json(await getGroupDetail(user, id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    const parsed = updateLibraryGroupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Group update was not understood." }, { status: 400 });
    }
    return NextResponse.json(await updateGroup(user, id, parsed.data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    return NextResponse.json(await deleteGroup(user, id));
  } catch (error) {
    return jsonError(error);
  }
}
