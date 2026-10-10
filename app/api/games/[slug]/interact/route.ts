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
          await Game.updateOne({ slug }, { $pull: { likes: email } });
          isLiked = false;
        } else {
          await Game.updateOne({ slug }, { $addToSet: { likes: email }, $pull: { dislikes: email } });
          isLiked = true;
          isDisliked = false;
        }
      } else if (action === "dislike") {
        if (isDisliked) {
          await Game.updateOne({ slug }, { $pull: { dislikes: email } });
          isDisliked = false;
        } else {
          await Game.updateOne({ slug }, { $addToSet: { dislikes: email }, $pull: { likes: email } });
          isDisliked = true;
          isLiked = false;
        }
      }
    } else if (action === "favorite") {
      if (isFavorited) {
        await User.updateOne({ email }, { $pull: { favorites: slug } });
        isFavorited = false;
      } else {
        if ((user.favorites?.length || 0) >= 6) {
          return NextResponse.json({ error: "You can only have up to 6 favorite games." }, { status: 400 });
        }
        await User.updateOne({ email }, { $addToSet: { favorites: slug } });
        isFavorited = true;
      }
    } else if (action === "status") {
      // Just fetch the current status
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Fetch refreshed vote counts directly and efficiently
    const updatedGame = await Game.findOne({ slug }, "likes dislikes").lean();
    const likeCount = (updatedGame as any)?.likes?.length || 0;
    const dislikeCount = (updatedGame as any)?.dislikes?.length || 0;

    return NextResponse.json({
      success: true,
      isLiked,
      isDisliked,
      isFavorited,
      likeCount,
      dislikeCount
    });
  } catch (error) {
    console.error("Interaction API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
