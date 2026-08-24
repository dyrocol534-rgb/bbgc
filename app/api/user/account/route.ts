import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Feedback from "@/models/Feedback";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userEmail = session.user.email;

    // Delete user account
    const deletedUser = await User.findOneAndDelete({ email: userEmail });

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clean up user-related records
    try {
      await Feedback.deleteMany({ userEmail });
    } catch (cleanupError) {
      console.error("Non-fatal error cleaning up user feedback records:", cleanupError);
    }

    return NextResponse.json({
      success: true,
      message: "Account and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
