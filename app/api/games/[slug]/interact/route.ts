import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import User from "@/models/User";
import Feedback from "@/models/Feedback";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { action, message } = body;
    const email = session.user.email;

    await dbConnect();
    
    if (action === "feedback") {
      if (!message || message.trim().length === 0) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
      }
      const feedback = await Feedback.create({
        gameSlug: slug,
        userEmail: email,
        message: message.trim()
      });
      return NextResponse.json({ success: true, feedback });
    }

    const game = await Game.findOne({ slug });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let isLiked = game.likes?.includes(email) || false;
    let isDisliked = game.dislikes?.includes(email) || false;
    let isFavorited = user.favorites?.includes(slug) || false;

    if (action === "like" || action === "dislike") {
      // Ensure user hasn't voted on any other game
      const existingVoteGame = await Game.findOne({
        $or: [{ likes: email }, { dislikes: email }],
        slug: { $ne: slug }
      });

      if (existingVoteGame) {
        return NextResponse.json({ error: "You can only vote (like or dislike) on 1 game maximum across the platform." }, { status: 400 });
      }

      if (action === "like") {
        if (isLiked) {
          game.likes = game.likes.filter((e: string) => e !== email);
        } else {
          game.likes.push(email);
          game.dislikes = game.dislikes.filter((e: string) => e !== email);
        }
        await game.save();
        isLiked = !isLiked;
        isDisliked = false;
      } else if (action === "dislike") {
        if (isDisliked) {
          game.dislikes = game.dislikes.filter((e: string) => e !== email);
        } else {
          game.dislikes.push(email);
          game.likes = game.likes.filter((e: string) => e !== email);
        }
        await game.save();
        isDisliked = !isDisliked;
        isLiked = false;
      }
    } else if (action === "favorite") {
      if (isFavorited) {
        user.favorites = user.favorites.filter((s: string) => s !== slug);
      } else {
        if (user.favorites.length >= 6) {
          return NextResponse.json({ error: "You can only have up to 6 favorite games." }, { status: 400 });
        }
        user.favorites.push(slug);
      }
      await user.save();
      isFavorited = !isFavorited;
    } else if (action === "status") {
      // Just fetch the current status
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      isLiked,
      isDisliked,
      isFavorited,
      likeCount: game.likes?.length || 0,
      dislikeCount: game.dislikes?.length || 0
    });
  } catch (error) {
    console.error("Interaction API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
