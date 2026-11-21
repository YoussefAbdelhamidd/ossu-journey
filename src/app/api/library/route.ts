import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { createGroup, listLibrary } from "@/lib/library";
import { createLibraryGroupSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    return NextResponse.json(await listLibrary(user));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const parsed = createLibraryGroupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Group data was not understood." }, { status: 400 });
    }
    const group = await createGroup(user, parsed.data);
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
