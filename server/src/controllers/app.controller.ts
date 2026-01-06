import logger from "@/config/logger";
import { cvModel } from "@/models/cv.models";
import { firstMessage } from "@/models/msg.model";
import { referredUsers } from "@/models/referrer.model";
import { token } from "@/models/tokens.model";
import { campaignQuest, miniQuest } from "@/models/quests.model";
import { user } from "@/models/user.model";
import { performIntuitionOnchainAction } from "@/utils/account";
import { BOT_TOKEN, THIRD_PARTY_API_KEY, X_API_BEARER_TOKEN } from "@/utils/env.utils";
import {
  INTERNAL_SERVER_ERROR, 
  OK,
  CREATED, 
  BAD_REQUEST,
  FORBIDDEN, 
  NOT_FOUND,
  UNAUTHORIZED
} from "@/utils/status.utils";
import { Client, UserPaginator, type PaginatedResponse, type Schemas } from "@xdevplatform/xdk";
import axios from "axios";
import { uploadImg } from "@/utils/img.utils";

export const home = async (req: GlobalRequest, res: GlobalResponse) => {
	res.send("hi!");
};

export const updateUser = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const profilePicBuffer = req.file?.buffer;

    const { username }: { username: string } = req.body;

    const userToUpdate = await user.findById(req.id);
    if (!userToUpdate) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
			return;
    }

    if (profilePicBuffer) {
      const profilePic = await uploadImg({ filename: req.file?.originalname, file: profilePicBuffer, folder: "profile-pictures" });
  
      userToUpdate.profilePic = profilePic;
    }

    if (userToUpdate.username !== username) {
      const usernameExists = await user.findOne({ username });
      if (usernameExists) {
        res.status(BAD_REQUEST).json({ error: "username already taken" });
        return;
      }
    }

    userToUpdate.username = username;

    await userToUpdate.save();

    const userReferred = await referredUsers.findOne({ newUser: userToUpdate._id });
    if (userReferred) {
      userReferred.username = username;
      await userReferred.save();
    }

    res.status(OK).json({ message: "user updated!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating user" });
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

const getXClient = ({ token, auth }: { token: string; auth?: string }) => {
  if (auth === "oauth2") {
    return new Client({ accessToken: token });
  }

  return new Client({ bearerToken: token });
}

export const checkXTask = async (req: GlobalRequest, res: GlobalResponse) => {
  const userToCheck = await user.findById(req.id);
  if (!userToCheck) {
    res.status(BAD_REQUEST).json({ error: "id associated with user is invalid" });
    return;
  }

  const xId = userToCheck.socialProfiles?.x?.id;
  if (!xId) {
    res.status(BAD_REQUEST).json({ error: "user X account not connected" });
    return;
  }

  const userToken = await token.findOne({ userId: xId });
  if (!userToken) {
    res.status(UNAUTHORIZED).json({ error: "auth tokens not found for user, kindly disconnect X account and login back" });
    return;
  }

  let xClient: Client;
  let quest: any | undefined = undefined;

  try {
    const { tag, id: postId, questId, page } = req.body; // get task id and store project x id, then remove hardcoded nexura id

    const NEXURA_ID = "1983300499597393920";
    if (page === "quest") {
      quest = await miniQuest.findById(questId);
      if (!quest) {
        res.status(NOT_FOUND).json({ error: "quest id is invalid" });
        return;
      }
    } else {
      quest = await campaignQuest.findById(questId);
      if (!quest) {
        res.status(NOT_FOUND).json({ error: "quest id is invalid" });
        return;
      }
    }

    const API_URL = "https://api.twitterapi.io/twitter";

    switch (tag) {
      case "follow":

        const { data: { followers } } = await axios.get(`${API_URL}/user/followers?userName=${"nexuraXYZ"}&pageSize=200`, {
          headers: {
            "X-API-Key": `${THIRD_PARTY_API_KEY}`,
          }
        });

        const isFollowing = followers.some((f: { id: string }) => f.id === xId);

        if (!isFollowing) {
          res.status(BAD_REQUEST).json({ error: "account not followed" });
          return;
        }

        res.status(OK).json({ message: "task verified", success: true });
        return;
      case "like":

        xClient = getXClient({ token: userToken.accessToken, auth: "oauth2"});

        const likedPosts: UserPaginator = new UserPaginator(
          async (token?: string): Promise<PaginatedResponse<Schemas.Tweet>> => {
            const res = await xClient.users.getLikedPosts(xId, {
              maxResults: 100,
              paginationToken: token,
              userFields: ["id"],
            });

            return {
              data: res.data ?? [],
              meta: res.meta,
              includes: res.includes,
              errors: res.errors,
            };
          }
        );

        await likedPosts.fetchNext();

        for await (const likedPost of likedPosts.users) {

          if (likedPost.id === postId) {
            res.status(OK).json({ message: "task verified", success: true });
            return;
          }

          if (!likedPosts.done) {
            await likedPosts.fetchNext();
          }
        }

        console.log("LE:", likedPosts.errors);

        res.status(BAD_REQUEST).json({ error: "tweet not liked" });
      return
      case "repost":

        const { data: { users } } = await axios.get(`${API_URL}/tweet/retweeters?tweetId=${postId}`, {
          headers : {
            "X-API-Key": `${THIRD_PARTY_API_KEY}`,
          }
        });

        const hasReposted = users.some((user: { id: string }) => user.id === xId);

        if (!hasReposted) {
          res.status(BAD_REQUEST).json({ error: "tweet not reposted" });
          return;
        }

        res.status(OK).json({ message: "task verified", success: true });

        return
      case "comment":
        const { data: { replies } } = await axios.get(`${API_URL}/tweet/replies?tweetId=${postId}`, {
          headers: {
            "X-API-Key": `${THIRD_PARTY_API_KEY}`,
          }
        });

        const hasReplied = replies.some((reply: { author: { id: string } }) => reply.author.id === xId);

        if (!hasReplied) {
          res.status(BAD_REQUEST).json({ error: "tweet not commented on" });
          return;
        }

        res.status(OK).json({ message: "task verified", success: true });
        return
      default:
        res.status(BAD_REQUEST).json({ error: "invalid task tag" });
        return;
    }
  } catch (error: any) {
    logger.error(error);
    if (error?.status === 429) {
      res.status(429).json({ error: "Oops, not fast enough. Rate limited by X API, try again after 16 mins" });
      return;
    }
    console.error({ error });
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error checking twitter task" });
  }
}

export const updateX = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req;
    const { x_id, username } = req.query as { x_id: string; username: string };

    if (!x_id || !username) {
      res.status(BAD_REQUEST).json({ error: "authorization was not successful" });
      return
    }

    const userToUpdate = await user.findById(id);
    if (!userToUpdate) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
      return;
    }

    const xAlreadyUsed = await user.findOne({ "socialProfiles.x.id": x_id });
    if (xAlreadyUsed && xAlreadyUsed._id !== userToUpdate._id) {
      res.status(BAD_REQUEST).json({ error: "x account already connected to another user" });
      return;
    }

    const userToken = await token.findOne({ userId: x_id });
    if (!userToken) {
      res.status(BAD_REQUEST).json({ error: "no access token or refresh token found, please connect x again" });
      return;
    }

    userToUpdate.socialProfiles ??= {};

    userToUpdate.socialProfiles.x = { connected: true, id: x_id, username };

    await userToUpdate.save();

    res.status(OK).json({ message: "connected!", user: userToUpdate });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error saving connected state" });
  }
}

export const updateDiscord = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req;
    const { discord_id, username } = req.query as { discord_id: string; username: string };

    if (!discord_id || !username) {
      res.status(BAD_REQUEST).json({ error: "authorization was not successful" });
      return
    }

    const userToUpdate = await user.findById(id);
    if (!userToUpdate) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
      return;
    }

    const discordAlreadyUsed = await user.findOne({ "socialProfiles.discord.id": discord_id });
    if (discordAlreadyUsed && discordAlreadyUsed._id !== userToUpdate._id) {
      res.status(BAD_REQUEST).json({ error: "discord account already connected to another user" });
      return;
    }

    userToUpdate.socialProfiles ??= {};

    userToUpdate.socialProfiles.discord = { connected: true, id: discord_id, username };

    await userToUpdate.save();

    res.status(OK).json({ message: "connected!", user: userToUpdate });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error saving connected state" });
  }
};

export const saveCv = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { codeVerifier, state } = req.query as { codeVerifier: string; state: string };
    if (!codeVerifier || !state) {
      res.status(BAD_REQUEST).json({ error: "code verifier and state is required" });
      return;
    }

    await cvModel.create({ cv: codeVerifier, state });

    res.status(OK).json({ message: "saved" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error saving code verifier" });
  }
}

export const checkDiscordTask = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { guildId, tag } = req.body;

    const userToCheck = await user.findById(req.id);
    if (!userToCheck) {
      res.status(BAD_REQUEST).json({ error: "id associated with user is invalid" });
      return;
    }

    const discordId = userToCheck.socialProfiles?.discord?.id;

    if (!discordId) {
      res.status(UNAUTHORIZED).json({ error: "connect discord to proceed" });
      return;
    }

    switch (tag) {
      case "join":
        const {
          status, 
          data: { roles }
          // remove hardcoded guild id
        } = await axios.get(`https://discord.com/api/guilds/1419336727302111367/members/${discordId}`,
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

        if (!roles.includes("1439591151081492593")) { // verfied id
          res.status(BAD_REQUEST).json({ error: "you need to be verified to continue" });
          return;
        }

        res.status(OK).json({ message: "validated", success: true });

        return;
      case "message":
        const sentMessage = await firstMessage.findOne({ user_id: discordId });
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