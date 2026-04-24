import { updateAdminLastActivity } from "@/utils/adminActivityCron";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import logger from "@/config/logger";
import { quest } from "@/models/quests.model";
import { admin } from "@/models/admin.model";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "@/utils/status.utils";
import { generateOTP, getRefreshToken, hashPassword, JWT, validateQuestData } from "@/utils/utils";
import { sendAdminResetEmail, sendEmailToAdmin } from "@/utils/sendMail";
import { campaignQuestCompleted, miniQuestCompleted } from "@/models/questsCompleted.models";
import { submission } from "@/models/submission.model";
import { user } from "@/models/user.model";
import { bannedUser } from "@/models/bannedUser.model";
import { REDIS } from "@/utils/redis.utils";

const MAX_ADMIN_LEADERBOARD_LIMIT = 500;
const DEFAULT_ADMIN_LEADERBOARD_LIMIT = 500;

const parsePositiveInt = (value: unknown, fallback: number) => {
	if (typeof value !== "string") return fallback;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeLeaderboardLimit = (value: unknown) =>
	Math.min(parsePositiveInt(value, DEFAULT_ADMIN_LEADERBOARD_LIMIT), MAX_ADMIN_LEADERBOARD_LIMIT);

const normalizeAdminRole = (role: unknown): "superadmin" | "admin" =>
	role === "superadmin" ? "superadmin" : "admin";

const buildAdminInviteCode = () => generateOTP();
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const formatAdminRecord = (record: {
	_id: unknown;
	username?: string | null;
	email: string;
	role: "superadmin" | "admin";
	createdAt?: Date;
	lastActivity?: Date | null;
	isOnline?: boolean;
}) => ({
	_id: record._id,
	name: record.username?.trim() || record.email.split("@")[0],
	username: record.username ?? undefined,
	email: record.email,
	role: record.role,
	createdAt: record.createdAt,
	lastActivity: record.lastActivity ?? null,
	isOnline: Boolean(record.isOnline),
});

const deriveBanTimestamp = (record: { _id: unknown; createdAt?: Date | string }) => {
  if (record.createdAt) {
    return record.createdAt;
  }

  const id = typeof record._id === "string" ? record._id : String(record._id);
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id).getTimestamp();
  }

  return null;
};

const buildAdminAuthPayload = (record: {
  _id: unknown;
  username?: string | null;
  email: string;
  role: "superadmin" | "admin";
  createdAt?: Date;
  lastActivity?: Date | null;
  isOnline?: boolean;
}) => {
  const id = String(record._id);
  const accessToken = JWT.sign(id);
  const refreshToken = getRefreshToken(id);

  return {
    id,
    accessToken,
    refreshToken,
    admin: formatAdminRecord(record),
  };
};

export const createQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { success } = validateQuestData(req.body);
		if (!success) {
			res
				.status(BAD_REQUEST)
				.json({ error: "send the correct data required to create a quest" });
			return;
		}

		const newQuest = new quest(req.body);
		if (newQuest.category !== "weekly") {
			await newQuest.save();
		} else {
			// new Date(new Date(Date.now() + 86400000).setHours(0, 60, 0, 0)); (quests expire at 12am UTC. For now, it expires 1 day after creation)
			newQuest.expires = new Date(Date.now() + 86400000);
			await newQuest.save();
		}

		res.status(OK).json({ message: "quest quest created!" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating quest" });
	}
};

export const rewardXp = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { address, xp }: { address: string, xp: string } = req.body;

		if (!address || !xp) {
			res.status(BAD_REQUEST).json({ error: "address and xp are required" });
			return;
		}

		await user.updateOne({ address: address.toLowerCase() }, { $inc: { xp: parseInt(xp, 10), eventsWon: 1 } });

		res.status(OK).json({ message: "xp rewarded" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
	}
};

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const MAX_BATCH_WALLETS = 500;

export const rewardXpBatch = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { addresses, xp }: { addresses: unknown; xp: unknown } = req.body;

		if (!Array.isArray(addresses) || addresses.length === 0) {
			res.status(BAD_REQUEST).json({ error: "addresses must be a non-empty array" });
			return;
		}

		if (addresses.length > MAX_BATCH_WALLETS) {
			res.status(BAD_REQUEST).json({ error: `max ${MAX_BATCH_WALLETS} wallets per batch` });
			return;
		}

		const xpAmount = typeof xp === "number" ? xp : typeof xp === "string" ? parseInt(xp, 10) : NaN;
		if (!Number.isFinite(xpAmount) || xpAmount <= 0) {
			res.status(BAD_REQUEST).json({ error: "xp must be a positive number" });
			return;
		}

		const invalid: string[] = [];
		const seen = new Set<string>();
		const normalized: string[] = [];
		for (const raw of addresses) {
			if (typeof raw !== "string") continue;
			const trimmed = raw.trim();
			if (!trimmed) continue;
			if (!EVM_ADDRESS_RE.test(trimmed)) {
				invalid.push(trimmed);
				continue;
			}
			const lower = trimmed.toLowerCase();
			if (seen.has(lower)) continue;
			seen.add(lower);
			normalized.push(lower);
		}

		if (normalized.length === 0) {
			res.status(OK).json({
				message: "no valid addresses",
				rewarded: 0,
				notFound: 0,
				invalid,
				xp: xpAmount,
			});
			return;
		}

		const existing = await user.find({ address: { $in: normalized } }, { address: 1 }).lean();
		const existingSet = new Set(existing.map((u) => (u.address || "").toLowerCase()));
		const matched = normalized.filter((addr) => existingSet.has(addr));
		const notFound = normalized.filter((addr) => !existingSet.has(addr));

		if (matched.length > 0) {
			await user.updateMany(
				{ address: { $in: matched } },
				{ $inc: { xp: xpAmount, eventsWon: 1 } },
			);
		}

		res.status(OK).json({
			message: "batch xp rewarded",
			rewarded: matched.length,
			notFound: notFound.length,
			notFoundAddresses: notFound,
			invalid,
			xp: xpAmount,
		});
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
	}
};

export const banUser = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { userId }: { userId: string } = req.body;

		const userExists = await user.findById(userId).lean();
		if (!userExists) {
			res.status(NOT_FOUND).json({ error: "user does not exist" });
			return;
		}

		await submission.updateMany({ user: userId }, { status: "banned" });
		await bannedUser.create({ userId, walletAddress: userExists.address });

		res.status(OK).json({ message: "user banned" });
	} catch (error) {
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error banning user" });
	}
}

export const getAdmins = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const records = await admin.find().sort({ createdAt: -1 }).lean();
    const admins = records.filter((record) => record.verified).map(formatAdminRecord);
    const pendingInvites = records
      .filter((record) => !record.verified)
      .map((record) => ({
        _id: record._id,
        email: record.email,
        role: record.role,
        createdAt: record.createdAt,
      }));
    const currentAdmin = records.find((record) => record._id.toString() === req.id);

    res.status(OK).json({
      message: "admins fetched",
      admins,
      pendingInvites,
      currentAdmin: currentAdmin ? formatAdminRecord(currentAdmin) : null,
    });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching admins" });
  }
};

export const adminLogout = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { token } = req;

    await REDIS.set({ key: `logout:${token}`, data: { token }, ttl: 7 * 24 * 60 * 60 });

    res.clearCookie("refreshToken");

    res.status(OK).json({ message: "admin logged out" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error logging out admin" });
  }
};

export const removeAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

    if (req.role !== "superadmin") {
      res.status(UNAUTHORIZED).json({ error: "only superadmin can remove admins" });
      return;
    }

		const { email }: { email: string } = req.body;
		if (!email) {
			res.status(BAD_REQUEST).json({ error: "send admin email" });
			return;
    }

		const adminExists = await admin.exists({ email });
		if (!adminExists) {
			res.status(NOT_FOUND).json({ error: "admin does not exist" });
			return;
		}

		if (adminExists._id.toString() === req.id) {
			res.status(BAD_REQUEST).json({ error: "you cannot remove your own account" });
			return;
		}

		await admin.findOneAndDelete({ email });

		res.status(OK).json({ message: "admin removed" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error removing admin" });
	}
}

export const addAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

    if (req.role !== "superadmin") {
      res.status(UNAUTHORIZED).json({ error: "only superadmin can add admins" });
      return;
    }

		const { email, role, clientUrl }: { email: string, role: "superadmin" | "admin", clientUrl?: string } = req.body;
		if (!email) {
			res.status(BAD_REQUEST).json({ error: "send admin email" });
			return;
		}

		const normalizedEmail = email.trim().toLowerCase();
		if (!isValidEmail(normalizedEmail)) {
			res.status(BAD_REQUEST).json({ error: "send a valid admin email" });
			return;
		}

		const normalizedRole = normalizeAdminRole(role);
		const existingAdmin = await admin.findOne({ email: normalizedEmail });
		if (existingAdmin?.verified) {
			res.status(BAD_REQUEST).json({ error: "admin with email exists" });
			return;
		}

		const code = buildAdminInviteCode();
		if (existingAdmin) {
			existingAdmin.role = normalizedRole;
			existingAdmin.code = code;
			await existingAdmin.save();
		} else {
			const newAdmin = new admin({
				email: normalizedEmail,
				role: normalizedRole,
				code,
				verified: false,
			});
			await newAdmin.save();
		}

		await sendEmailToAdmin(normalizedEmail, code, clientUrl);

		res.status(OK).json({ message: "otp sent" });
	} catch (error) {
		console.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding admin" });
	}
}

export const resendAdminInvite = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    if (req.role !== "superadmin") {
      res.status(UNAUTHORIZED).json({ error: "only superadmin can resend admin invites" });
      return;
    }

    const { inviteId, clientUrl }: { inviteId?: string; clientUrl?: string } = req.body;
    if (!inviteId) {
      res.status(BAD_REQUEST).json({ error: "inviteId is required" });
      return;
    }

    const pendingAdmin = await admin.findOne({ _id: inviteId, verified: false });
    if (!pendingAdmin) {
      res.status(NOT_FOUND).json({ error: "pending invite does not exist" });
      return;
    }

    pendingAdmin.code = buildAdminInviteCode();
    await pendingAdmin.save();
    await sendEmailToAdmin(pendingAdmin.email, pendingAdmin.code, clientUrl);

    res.status(OK).json({ message: "admin invite resent" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error resending admin invite" });
  }
};

export const deleteAdminInvite = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    if (req.role !== "superadmin") {
      res.status(UNAUTHORIZED).json({ error: "only superadmin can delete admin invites" });
      return;
    }

    const inviteId = typeof req.query.id === "string" ? req.query.id : "";
    if (!inviteId) {
      res.status(BAD_REQUEST).json({ error: "invite id is required" });
      return;
    }

    const pendingAdmin = await admin.findOneAndDelete({ _id: inviteId, verified: false });
    if (!pendingAdmin) {
      res.status(NOT_FOUND).json({ error: "pending invite does not exist" });
      return;
    }

    res.status(OK).json({ message: "admin invite deleted" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error deleting admin invite" });
  }
};

export const adminLogin = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { email, password }: { email: string; password: string } = req.body;

		const adminExists = await admin.findOne({ email });
		if (!adminExists) {
			res.status(BAD_REQUEST).json({ error: "invalid credentials" });
			return;
		}

		const passwordCorrect = await bcrypt.compare(password, adminExists.password ?? "");
		if (!passwordCorrect) {
			res.status(BAD_REQUEST).json({ error: "invalid credentials" });
			return;
    }
		
    const { id, accessToken, refreshToken, admin: authAdmin } = buildAdminAuthPayload(adminExists.toObject());

		req.id = id;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

    // Update admin activity on login
    updateAdminLastActivity(id);
		res.status(OK).json({
      message: "admin logged in",
      accessToken,
      admin: authAdmin,
    });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching tasks" });
	}
};

export const createAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { password, email, code, username, name }: {
      username?: string;
      name?: string;
      password: string;
      code: string;
      email: string;
    } = req.body;
    const resolvedUsername = (username || name || "").trim();

		if (!password || !email || !resolvedUsername || !code) {
			res.status(BAD_REQUEST).json({ error: "send the required details" });
			return;
		}

		const semiAdmin = await admin.findOne({ email, verified: false });
		if (!semiAdmin) {
			res.status(NOT_FOUND).json({ error: "email is invalid or admin has been verified. contact master admin if issue persists" });
			return;
		}

		if (code !== semiAdmin.code) {
			res.status(UNAUTHORIZED).json({ error: "code sent is invalid" });
			return;
		}

		const hashedPassword = await hashPassword(password);

		semiAdmin.verified = true;
		semiAdmin.password = hashedPassword;
		semiAdmin.username = resolvedUsername;
		semiAdmin.code = "";

    await semiAdmin.save();

    const { id, accessToken, refreshToken, admin: authAdmin } = buildAdminAuthPayload(semiAdmin.toObject());

		req.id = id;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(OK).json({
      message: "admin verified",
      accessToken,
      admin: authAdmin,
    });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching tasks" });
	}
};

export const getTasks = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

		const pendingTasks = await submission.find({ hub: "nexura-hub" }).lean().sort({ createdAt: 1 });

		res.status(OK).json({ message: "submitted tasks fetched", pendingTasks });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching tasks" });
	}
};

export const getBannedUsers = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const bannedUsers = (await bannedUser.find().sort({ createdAt: -1 }).lean()).map((entry) => ({
      ...entry,
      bannedAt: deriveBanTimestamp(entry),
    }));

		res.status(OK).json({ message: "banned users fetched", bannedUsers });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching tasks" });
	}
};

export const forgotAdminPassword = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { email, clientUrl }: { email?: string; clientUrl?: string } = req.body;
    if (!email) {
      res.status(BAD_REQUEST).json({ error: "email is required" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      res.status(BAD_REQUEST).json({ error: "send a valid admin email" });
      return;
    }

    const adminExists = await admin.findOne({ email: normalizedEmail, verified: true }).lean();
    if (!adminExists) {
      res.status(NOT_FOUND).json({ error: "email associated with admin is invalid or does not exist" });
      return;
    }

    const token = JWT.sign(adminExists._id.toString(), "10m");
    await sendAdminResetEmail(normalizedEmail, token, clientUrl);

    res.status(OK).json({ message: "password reset email sent!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Error sending admin password reset email" });
  }
};

export const resetAdminPassword = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };

    if (!token || !password) {
      res.status(BAD_REQUEST).json({ error: "send token and password" });
      return;
    }

    const accessTokenUsed = await REDIS.get(`admin-reset-access-token:${token}`);
    if (accessTokenUsed) {
      res.status(BAD_REQUEST).json({ error: "access token already used, request a new one to change your password" });
      return;
    }

    const { id } = await JWT.verify(token) as { id: string };
    const adminExists = await admin.findOne({ _id: id, verified: true });

    if (!adminExists) {
      res.status(BAD_REQUEST).json({ error: "id associated with admin is invalid" });
      return;
    }

    adminExists.password = await hashPassword(password);
    await adminExists.save();

    await REDIS.set({ key: `admin-reset-access-token:${token}`, data: { token }, ttl: 10 * 60 });

    const { accessToken, refreshToken, admin: authAdmin } = buildAdminAuthPayload(adminExists.toObject());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60,
    });

    res.status(OK).json({
      message: "admin password reset successful!",
      accessToken,
      admin: authAdmin,
    });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Error resetting admin password" });
  }
};

export const getUserSummary = async (_req: GlobalRequest, res: GlobalResponse) => {
	try {
		const totalUsers = await user.countDocuments();
		res.status(OK).json({ message: "user summary fetched", totalUsers });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching user summary" });
	}
};

export const getAdminLeaderboard = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const page = parsePositiveInt(req.query.page, 1);
		const limit = normalizeLeaderboardLimit(req.query.limit);
		const skip = (page - 1) * limit;

		const totalUsers = await user.countDocuments();
		const totalPages = totalUsers === 0 ? 1 : Math.ceil(totalUsers / limit);

		const items = await user
			.find()
			.sort({ xp: -1, trustClaimed: -1, _id: 1 })
			.select("_id address username profilePic eventsWon lessonsCompleted xp level questsCompleted campaignsCompleted noOfMints")
			.lean();

		const leaderboardItems = items.map((entry, index) => ({
			...entry,
			rank: index + 1,
		}));

		res.status(OK).json({
			message: "admin leaderboard fetched",
			items: leaderboardItems,
			totalUsers,
			totalPages,
			page,
			limit,
		});
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching admin leaderboard" });
	}
};

export const unBanUser = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { userId }: { userId: string } = req.body;

		const bannedUserExists = await bannedUser.findById(userId).lean();
		if (!bannedUserExists) {
			res.status(BAD_REQUEST).json({ error: "banned user does not exist" });
			return;
		}

		await bannedUser.findByIdAndDelete(userId);
		await submission.updateMany({ user: bannedUserExists.userId }, { status: "pending" });

		res.status(OK).json({ message: "user unbanned" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching tasks" });
	}
};

export const manageAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    if (req.role !== "superadmin") {
      res.status(UNAUTHORIZED).json({ error: "only superadmin can manage other admins" });
      return;
    }

    const { action, adminId, adminName, newRole }: {
      action: "update_role" | "demote" | "revoke";
      adminId?: string;
      adminName?: string;
      newRole?: string;
    } = req.body;

    if (!action) {
      res.status(BAD_REQUEST).json({ error: "action is required" });
      return;
    }

    // Find target admin by ID or username
    const targetAdmin = adminId
      ? await admin.findById(adminId)
      : adminName
      ? await admin.findOne({ username: adminName })
      : null;

    if (!targetAdmin) {
      res.status(NOT_FOUND).json({ error: "admin not found" });
      return;
    }

    // Prevent acting on yourself regardless of how the target was identified
    if (targetAdmin._id.toString() === req.id) {
      res.status(BAD_REQUEST).json({ error: "you cannot manage your own account" });
      return;
    }

    if (action === "update_role") {
      const allowed = ["superadmin", "admin"];
      if (!newRole || !allowed.includes(newRole)) {
        res.status(BAD_REQUEST).json({ error: `newRole must be one of: ${allowed.join(", ")}` });
        return;
      }

      targetAdmin.role = newRole as "superadmin" | "admin";
      await targetAdmin.save();

      res.status(OK).json({ message: `admin role updated to ${newRole}` });
      return;
    }

    if (action === "demote") {
      targetAdmin.role = "admin";
      await targetAdmin.save();

      res.status(OK).json({ message: "admin demoted to admin role" });
      return;
    }

    if (action === "revoke") {
      await admin.findByIdAndDelete(targetAdmin._id);

      res.status(OK).json({ message: "admin access revoked" });
      return;
    }

    res.status(BAD_REQUEST).json({ error: "unknown action" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error managing admin" });
  }
};

export const markTask = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { id, action }: { id: string; action: string } = req.body;

		const adminExists = await admin.findById(req.id);
		if (!adminExists) {
			res.status(BAD_REQUEST).json({ error: "id associated with admin is invalid" });
			return;
		}

		const submissionToBeVerified = await submission.findById(id);

		if (!submissionToBeVerified) {
			res.status(NOT_FOUND).json({ error: "task does not exist" });
			return
		}

		let model;

		if (submissionToBeVerified.page === "quest") {
			model = await miniQuestCompleted.findOne({ _id: submissionToBeVerified.questCompleted, status: { $in: ["pending", "retry"] } });
			if (!model) {
				res.status(NOT_FOUND).json({ error: "mini quest already completed or is invalid" });
				return
			}

		} else {
			model = await campaignQuestCompleted.findOne({ _id: submissionToBeVerified.questCompleted, status: { $in: ["pending", "retry"] } });
			if (!model) {
				res.status(NOT_FOUND).json({ error: "campaign quest already completed or is invalid" });
				return
			}
		}

		if (action !== "accept") {
			submissionToBeVerified.status = "retry";
			submissionToBeVerified.validatedBy = adminExists.username;
			model.status = "retry";
		} else {
			submissionToBeVerified.status = "done";
			submissionToBeVerified.validatedBy = adminExists.username;
			model.status = "done";
			model.done = true;
		}

		await submissionToBeVerified.save();
		await model.save();

		res.status(OK).json({ message: "submission marked" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error marking submission" });
	}
}
