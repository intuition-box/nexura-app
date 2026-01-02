import logger from "@/config/logger";
import { cvModel } from "@/models/cv.models";
import { firstMessage } from "@/models/msg.model";
import { referredUsers } from "@/models/referrer.model";
import { token } from "@/models/tokens.models";
import { user } from "@/models/user.model";
import { performIntuitionOnchainAction } from "@/utils/account";
import { BOT_TOKEN, X_API_BEARER_TOKEN } from "@/utils/env.utils";
import { INTERNAL_SERVER_ERROR, OK, CREATED, BAD_REQUEST, FORBIDDEN, NOT_FOUND, UNAUTHORIZED } from "@/utils/status.utils";
import { Client, UserPaginator, type PaginatedResponse, type Schemas } from "@xdevplatform/xdk";
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

    const usernameExists = await user.findOne({ username });
    if (usernameExists) {
      res.status(BAD_REQUEST).json({ error: "username already taken" });
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

const getXClient = ({ token, auth }: { token: string; auth?: string }) => {
  if (auth === "oauth2") {
    return new Client({ accessToken: token });
  }

  return new Client({ bearerToken: token });
}

export const checkXTask = async (req: GlobalRequest, res: GlobalResponse) => {

  const userToken = await token.findOne({ userId: req.id });
  if (!userToken) {
    res.status(UNAUTHORIZED).json({ error: "connect X account to proceed" });
    return;
  }

  let xClient: Client;

  try {
    const { tag, id: postId } = req.body; // get task id and store project x id, then remove hardcoded nexura id

    const NEXURA_ID = "1983300499597393920";

    const userToCheck = await user.findById(req.id);
    if (!userToCheck) {
      res.status(BAD_REQUEST).json({ error: "id associated with user is invalid" });
      return;
    }

    
    const xId = userToCheck.socialProfiles?.x?.id;
    
    switch (tag) {
      case "follow":
        xClient = getXClient({ token: userToken.accessToken, auth: "oauth2"});

        const followers: UserPaginator = new UserPaginator(
          async (token?: string): Promise<PaginatedResponse<Schemas.User>> => {
            const res = await xClient.users.getFollowers(NEXURA_ID, {
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

        console.log({ t: 1, followers: followers.users });

        await followers.fetchNext();
        console.log({ t: 2, followers: followers.users });

        for await (const follower of followers.users) {
          console.log({follower})
          if (follower.id === xId) {
            res.status(OK).json({ message: "task verified" });
            return;
          }

          if (!followers.done) {
            await followers.fetchNext();
          }
        }
        console.log("FO:", followers.errors);

        res.status(BAD_REQUEST).json({ error: "account not followed" });
        return;
      case "like":
        if (!xId) {
          res.status(BAD_REQUEST).json({ error: "user X account not connected" });
          return;
        }

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

        console.log({ t: 1, likedPosts: likedPosts.users });

        await likedPosts.fetchNext();
        console.log({ t: 2, likedPosts: likedPosts.users });

        for await (const likedPost of likedPosts.users) {
          console.log({likedPost})
          if (likedPost.id === postId) {
            res.status(OK).json({ message: "task verified" });
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
        xClient = getXClient({ token: X_API_BEARER_TOKEN });

        const reposts: UserPaginator = new UserPaginator(
					async (token?: string): Promise<PaginatedResponse<Schemas.User>> => {
						const res = await xClient.posts.getRepostedBy(postId, {
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
        
        console.log({ t: 1, reposts: reposts.users });

        await reposts.fetchNext();
        console.log({ t: 2, reposts: reposts.users });

        for await (const repost of reposts.users) {
          console.log({ repost });
          if (repost.id === postId) {
            res.status(OK).json({ message: "task verified" });
            return;
          }

          if (!reposts.done) {
            await reposts.fetchNext();
          }
        }

        console.log("RE:", reposts.errors);

        res.status(BAD_REQUEST).json({ error: "tweet not reposted" });

        return
      default:
        res.status(BAD_REQUEST).json({ error: "invalid task tag" });
        return;
    }
  } catch (error) {
    logger.error(error);
    // if (error.code === 401)
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

    res.status(OK).json({ messages: "connected!", user: userToUpdate });
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

    res.status(OK).json({ messages: "connected!", user: userToUpdate });
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