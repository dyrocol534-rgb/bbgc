import User from "@/models/User";
import mongoose from "mongoose";

export const XP_CONFIG = {
  PLAY_GAME: 1, // XP awarded once per game session
  PLAYTIME_PER_HOUR: 5, // XP awarded for 3600 seconds of playtime
  REFERRAL_REWARD: 50, // XP to both users when referred user plays 10 games
  DAILY_LOGIN: 5, // Base XP for logging in
  STREAK_BONUS_PER_DAY: 10, // Additional XP per consecutive day
  MAX_STREAK_BONUS: 100, // Cap on streak bonus (e.g., max +100 XP extra)
  GAMES_REQUIRED_FOR_REFERRAL: 10, // Milestone for referral payout
};

/**
 * Awards XP to a user and updates their lifetime XP.
 */
export async function awardXP(userId: string, amount: number) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  
  return await User.findByIdAndUpdate(
    userId,
    { 
      $inc: { 
        xp: amount,
        lifetimeXp: amount
      } 
    },
    { new: true }
  );
}

/**
 * Checks and updates the user's daily streak. Awards daily login XP.
 * Should be called when the user visits the site or logs in.
 */
export async function processDailyLogin(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  const lastStreakDate = user.lastStreakDate;
  
  let newStreak = user.currentStreak;
  let shouldAwardDaily = false;

  if (!lastStreakDate) {
    // First ever login
    newStreak = 1;
    shouldAwardDaily = true;
  } else {
    const timeDiffMs = now.getTime() - lastStreakDate.getTime();
    const daysDiff = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
    
    // Simplistic calendar day check based on 24h rolling windows
    if (daysDiff === 1 || (daysDiff === 0 && now.getDate() !== lastStreakDate.getDate())) {
      newStreak += 1;
      shouldAwardDaily = true;
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
      shouldAwardDaily = true;
    }
    // If daysDiff === 0 and same calendar day, do nothing (streak maintained, no new award).
  }

  if (shouldAwardDaily) {
    const streakBonus = Math.min(
      (newStreak - 1) * XP_CONFIG.STREAK_BONUS_PER_DAY, 
      XP_CONFIG.MAX_STREAK_BONUS
    );
    const totalAward = XP_CONFIG.DAILY_LOGIN + streakBonus;

    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          currentStreak: newStreak,
          lastStreakDate: now,
        },
        $inc: {
          xp: totalAward,
          lifetimeXp: totalAward
        }
      },
      { new: true }
    );
  }

  return user;
}
