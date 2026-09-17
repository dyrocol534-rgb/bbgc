import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { getRecentGamesForUserOrGuest } from "@/lib/services/gameService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guestId")?.value;

    const games = await getRecentGamesForUserOrGuest(session, guestId, 10);

    return NextResponse.json(
      { games },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/user/recent:", error);
    return NextResponse.json({ games: [] }, { status: 500 });
  }
}
