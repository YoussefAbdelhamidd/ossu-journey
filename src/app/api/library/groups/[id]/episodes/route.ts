import { NextResponse } from "next/server";
import { jsonError, requireUser, sessionFromRequest } from "@/lib/auth";
import { addEpisode } from "@/lib/library";
import { createLibraryEpisodeSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = requireUser(await sessionFromRequest(request));
    const { id } = await params;
    const parsed = createLibraryEpisodeSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Episode data was not understood." }, { status: 400 });
    }
    const episode = await addEpisode(user, id, parsed.data);
    return NextResponse.json(episode, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
