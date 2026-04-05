import { admin } from "@/models/admin.model";
import { hub } from "@/models/hub.model";

export const ADMIN_CAMPAIGN_SYSTEM_KEY = "nexura-admin-campaigns";
export const ADMIN_CAMPAIGN_HUB_NAME = "nexura";
export const ADMIN_CAMPAIGN_HUB_DESCRIPTION = "Official Nexura campaigns.";
export const ADMIN_CAMPAIGN_HUB_LOGO = "/nexura-logo.png";

const resolveHubOwnerId = async (fallbackAdminId?: string) => {
  if (fallbackAdminId) {
    const exists = await admin.findById(fallbackAdminId).select("_id").lean();
    if (exists?._id) return String(exists._id);
  }

  const superAdminRecord = await admin
    .findOne({ verified: true, role: "superadmin" })
    .select("_id")
    .lean();
  if (superAdminRecord?._id) return String(superAdminRecord._id);

  const anyVerifiedAdmin = await admin.findOne({ verified: true }).select("_id").lean();
  if (anyVerifiedAdmin?._id) return String(anyVerifiedAdmin._id);

  throw new Error("No admin account is available to attach the Nexura campaigns hub.");
};

const applyHubDefaults = async (hubId: string, ownerId: string) => {
  const updatedHub = await hub.findByIdAndUpdate(
    hubId,
    {
      $set: {
        systemKey: ADMIN_CAMPAIGN_SYSTEM_KEY,
        name: ADMIN_CAMPAIGN_HUB_NAME,
        description: ADMIN_CAMPAIGN_HUB_DESCRIPTION,
        logo: ADMIN_CAMPAIGN_HUB_LOGO,
        superAdmin: ownerId,
      },
    },
    { new: true }
  );

  if (!updatedHub) {
    throw new Error("Unable to prepare the Nexura campaigns hub.");
  }

  return updatedHub;
};

export const resolveAdminCampaignHub = async (fallbackAdminId?: string) => {
  const ownerId = await resolveHubOwnerId(fallbackAdminId);

  const systemHub = await hub.findOne({ systemKey: ADMIN_CAMPAIGN_SYSTEM_KEY });
  if (systemHub) {
    return applyHubDefaults(String(systemHub._id), ownerId);
  }

  return hub.create({
    systemKey: ADMIN_CAMPAIGN_SYSTEM_KEY,
    name: ADMIN_CAMPAIGN_HUB_NAME,
    description: ADMIN_CAMPAIGN_HUB_DESCRIPTION,
    logo: ADMIN_CAMPAIGN_HUB_LOGO,
    superAdmin: ownerId,
    xpAllocated: 200,
  });
};
