import logger from "@/config/logger";
import { firstMessage } from "@/models/msg.model";
import { referredUsers } from "@/models/referrer.model";
import { user } from "@/models/user.model";
import { performIntuitionOnchainAction } from "@/utils/account";
import { BOT_TOKEN } from "@/utils/env.utils";
import { INTERNAL_SERVER_ERROR, OK, CREATED, BAD_REQUEST, FORBIDDEN } from "@/utils/status.utils";
import axios from "axios";

export const home = async (req: GlobalRequest, res: GlobalResponse) => {
	res.send("hi!");
};

export const updateUsername = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { username }: { username: string } = req.body;

    const userToUpdate = await user.findById(req.id);

    if (!userToUpdate) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
			return;
    }

    userToUpdate.username = username;
    await userToUpdate.save();

    const userReferred = await referredUsers.findOne({ newUser: userToUpdate._id });
    if (userReferred) {
      userReferred.username = username;
      await userReferred.save();
    }

    res.status(OK).json({ message: "username updated!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating username" });
  }
}

export const getLeaderboard = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userData = await user.find();

    const leaderboardByXp = userData.sort((a, b) => b.xp - a.xp).slice(0, 20);
    const leaderboardByTrustTokens = userData.sort((a, b) => b.trustEarned - a.trustEarned).slice(0, 20);

    const leaderboardInfo = {
      leaderboardByXp,
      leaderboardByTrustTokens
    }

    res.status(OK).json({ message: "leaderboard info fetched", leaderboardInfo });
  } catch(error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching leaderboard data" })
  }
}

export const fetchUser = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userFetched = await user.findById(req.id);

    if (!userFetched) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
      return;
    }

    res.status(OK).json({ message: "user fetched!", user: userFetched });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching user data" });
  }
}

export const referralInfo = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const id = req.id;
    const userFetched = await user.findById(id);

    if (!userFetched) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
      return;
    }

    const usersReferred = await referredUsers.find({ user: id });

    res.status(OK).json({ message: "referral info fetched!", referralCode: userFetched.referral!.code, usersReferred });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching referral info" });
  }
}

export const allowRefRewardClaim = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userId = req.id!;

    const usersReferred = await referredUsers.find({ user: userId });

    const activeUsers = usersReferred.filter((u) => u.status === "Active");
    if (activeUsers.length < 10) {
      res.status(FORBIDDEN).json({ error: "active users threshold hasn't been met!" });
      return;
    }

    await performIntuitionOnchainAction({
      action: "claim-ref-reward",
      userId,
    });

    res.status(OK).json({ message: "user allowed to claim referrer reward!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error allowing user to claim referrer reward" })
  }
};

export const claimReferreralReward = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userId = req.id!;

    const referrer = await user.findById(userId);
    if (!referrer) {
      res.status(BAD_REQUEST).json({ error: "id associated with user is invalid" });
      return;
    }

    if (referrer.refRewardClaimed) {
      res.status(BAD_REQUEST).json({ error: "referrer reward claimed" });
      return;
    }

    const usersReferred = await referredUsers.find({ user: userId });

    const activeUsers = usersReferred.filter((u) => u.status === "Active");
    if (activeUsers.length < 10) {
      res.status(FORBIDDEN).json({ error: "active users threshold hasn't been met!" });
      return;
    }

    referrer.trustEarned += 16.2;
    await referrer.save();

    res.status(OK).json({ message: "referral reward claimed!" });
  } catch(error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error claiming referral reward" });
  }
};

export const checkXTask = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { tag, id, userId } = req.body;

    res.status(OK).json({ message: "user has sent message", success: true });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error checking twitter task" });
  }
}
//  - g_id
export const checkDiscordTask = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { guildId, tag, userId } = req.body;

    switch (tag) {
      case "join":
        const {
          status, 
          data: { roles }
          // remove hardcoded guild id
        } = await axios.get(`https://discord.com/api/guilds/1419336727302111367/members/${userId}`,
          {
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
            },
          }
        );

        if (status !== OK) {
          res.status(BAD_REQUEST).json({ error: "join the discord server and get verified" });
          return;
        }

        logger.info(roles);

        if (!roles.includes("VERIFIED_ROLE_ID")) {
          res.status(BAD_REQUEST).json({ error: "you need to be verified to continue" });
          return;
        }

        res.status(OK).json({ message: "validated", success: true });

        return;
      case "message":
        const sentMessage = await firstMessage.findOne({ user_id: userId });
        if (!sentMessage) {
          res.status(BAD_REQUEST).json({ error: "send a message to the server to continue" });
          return;
        }

        res.status(OK).json({ message: "user has sent message", success: true });

        return;
    }
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error checking discord task" })
  }
}