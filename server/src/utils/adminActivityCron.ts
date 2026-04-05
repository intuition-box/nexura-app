import { admin } from "@/models/admin.model";
import logger from "@/config/logger";

// Cron job to update admin online status every 5 seconds
// Mark admins as offline if they haven't been active for more than 30 seconds
export function startAdminActivityCron() {
  // Run immediately on start
  updateAdminActivity();

  // Then run every 5 seconds
  setInterval(() => {
    updateAdminActivity();
  }, 5000);

  logger.info("Admin activity cron job started (5s interval)");
}

async function updateAdminActivity() {
  try {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30000);

    // 1. Mark all admins who have been active in the last 30 seconds as online
    await admin.updateMany(
      { lastActivity: { $gt: thirtySecondsAgo } },
      { $set: { isOnline: true } }
    );

    // 2. Mark all admins who haven't been active in the last 30 seconds as offline
    await admin.updateMany(
      { lastActivity: { $lte: thirtySecondsAgo }, isOnline: true },
      { $set: { isOnline: false } }
    );
  } catch (error) {
    logger.error("Error updating admin activity:", error);
  }
}

// Function to update an admin's last activity (called when admin makes a request)
export async function updateAdminLastActivity(adminId: string) {
  try {
    await admin.findByIdAndUpdate(adminId, {
      $set: {
        lastActivity: new Date(),
        isOnline: true
      }
    });
  } catch (error) {
    logger.error("Error updating admin last activity:", error);
  }
}
