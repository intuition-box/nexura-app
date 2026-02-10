import logger from "@/config/logger";
import { cvModel } from "@/models/cv.models";
import { firstMessage } from "@/models/msg.model";
import { referredUsers } from "@/models/referrer.model";
import { token } from "@/models/tokens.model";
import { campaignQuest, miniQuest, quest } from "@/models/quests.model";
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
import { timer } from "@/models/twitterTimer.model";
import { REDIS } from "@/utils/redis.utils";
import { submission } from "@/models/submission.model";
import {
	campaignQuestCompleted,
	miniQuestCompleted,
  questCompleted
} from "@/models/questsCompleted.models";
import { bannedUser } from "@/models/bannedUser.model";
import { GRAPHQL_API_URL } from "@/utils/constants";
import { GraphQLClient } from "graphql-request";
import { checksumAddress } from "viem";
import { campaign, campaignCompleted } from "@/models/campaign.model";
import { dailySignIn } from "@/models/dailySignIn.model";
import { startOfDayUTC } from "@/utils/utils";

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
      const usernameExists = await user.findOne({ username }).lean();
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

export const updateSubmission = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userId = req.id;
    const { miniQuestId, submissionLink }: { miniQuestId: string; submissionLink: string; } = req.body;

    if (!submissionLink || !miniQuestId) {
      res.status(BAD_REQUEST).json({ error: "send the required details" });
      return;
    }

    const task = await submission.findOne({ user: userId, miniQuestId });
    if (!task) {
      res.status(BAD_REQUEST).json({ error: "user does not have any submission" });
      return;
    }

    if (task.status === "pending") {
      res.status(FORBIDDEN).json({ error: "submission is still pending review" });
      return;
    } else if (task.status === "done") { 
      res.status(FORBIDDEN).json({ error: "quest has been marked as done" });
      return;
    }

    let completed;

    if (task.page === "quest") {
      completed = await miniQuestCompleted.findById(task.questCompleted);
      if (!completed) {
        res.status(BAD_REQUEST).json({ error: "mini quest completed id is invalid" });
        return
      }
    } else {
      completed = await campaignQuestCompleted.findById(task.questCompleted);
      if (!completed) {
        res.status(BAD_REQUEST).json({ error: "campaign quest completed id is invalid" });
        return
      }
    }

    completed.status = "pending";
    task.status = "pending";
    task.submissionLink = submissionLink;

    await task.save();
    await completed.save();

    res.status(OK).json({ message: "submission updated!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating submission" });
  }
}

export const getLeaderboard = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const top200 = await user
      .find()
      .sort({ xp: -1, trustClaimed: -1 })
      .limit(200)
      .select("username xp profilePic _id level questsCompleted campaignsCompleted")
      .lean();

    let rank: number | null = null;

    const me = await user.findById(req.id).lean();

    if (!me) {
      rank = null;
    } else {
      rank =
        (await user.countDocuments({
          $or: [
            { xp: { $gt: me.xp } },
            {
              xp: me.xp,
              updatedAt: { $lt: me.updatedAt },
            },
          ],
        })) + 1;
    }

    res.status(OK).json({ message: "leaderboard info fetched", leaderboardInfo: top200, rank });
  } catch(error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching leaderboard data" })
  }
}  

export const fetchUser = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userFetched = await user.findById(req.id).lean();

    if (!userFetched) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
      return;
    }

    const date = new Date();

    const onlyDate = date.toISOString().split("T")[0];

    const openDailySignIn = onlyDate === userFetched.lastSignInDate ? false : true;

    res.status(OK).json({ message: "user fetched!", user: userFetched, openDailySignIn });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching user data" });
  }
}

export const referralInfo = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const id = req.id as string;
    const userFetched = await user.findById(id);

    if (!userFetched) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
      return;
    }

    const usersReferred = await referredUsers.find({ user: id }).lean();
    const activeUsers = usersReferred.filter((user: { status: string }) => user.status === "Active");
    if (activeUsers.length >= 10) {
      if (!userFetched.refRewardClaimed && !userFetched.referralAllowed) {
        await performIntuitionOnchainAction({
          action: "allow-ref-reward",
          userId: id,
        });

        userFetched.referralAllowed = true;

        await userFetched.save();
      }
    }

    res.status(OK).json({ message: "referral info fetched!", refRewardClaimed: userFetched.refRewardClaimed, usersReferred });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching referral info" });
  }
}

export const updateBadge = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { level }: { level: number } = req.body
    const userToUpdate = await user.findById(req.id);

    if (isNaN(level)) {
      res.status(BAD_REQUEST).json({ error: "send level as a number" });
      return;
    }

    if (!userToUpdate) {
      res.status(BAD_REQUEST).json({ error: "invalid user id" });
      return;
    }

    if (!userToUpdate.badges.includes(level)) {
      userToUpdate.badges.push(level);

      await userToUpdate.save();

      res.status(OK).json({ message: "badge updated" });
      return;
    }

    res.status(BAD_REQUEST).json({ error: "user already has the badge" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating badge" });
  }
}

export const validatePortalTask =  async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { termId, id, questId, page }: { page: string; termId: string; id: string; questId: string } = req.body;

    const userToCheck = await user.findById(req.id);
    if (!userToCheck) {
      res.status(BAD_REQUEST).json({ error: "id associated with user is invalid" });
      return;
    }

    // set shares to be from 0.01
    const query = `
      query GetTriple($id: String!, $address: String!) {
        triple(term_id: $id) {
          positions (where:  {
            account_id:  {
              _eq: $address
            }
            shares:  {
              _gte: 10000000000000000
            }
          }) {
            account_id
          }
      
          counter_positions (where:  {
            account_id:  {
              _eq: $address
            }
            shares:  {
              _gte: 10000000000000000
            }
          }) {
            account_id
          }
        }
      }
    `; // user needs to atleast support or oppose with 0.5 - 1 trust;

    const client = new GraphQLClient(GRAPHQL_API_URL);

    const formattedAddress = checksumAddress(userToCheck.address as `0x${string}`);

    const response = await client.request(query, { id: termId, address: formattedAddress });

    const { triple } = response;

    if (!triple) {
      res.status(NOT_FOUND).json({ error: "term id is invaid" });
      return
    }

    const supportFound = triple.positions.length;
    const opposeFound = triple.counter_positions.length;

    if (page !== "campaign") {
      const miniQuestExists = await miniQuestCompleted.findOne({ miniQuest: id, quest: questId, user: userToCheck._id });

      if (!miniQuestExists) {
        if (!supportFound && !opposeFound) {
          await miniQuestCompleted.create({ miniQuest: id, quest: questId, done: false, status: "retry", user: userToCheck._id });
        } else {
          await miniQuestCompleted.create({ miniQuest: id, quest: questId, done: true, status: "done", user: userToCheck._id });

          res.status(OK).json({ message: "task completed" });
          return;
        }
      } else {
        if (!supportFound && !opposeFound) {
          miniQuestExists.done = false;
          miniQuestExists.status = "retry";

          await miniQuestExists!.save();
        } else {
          miniQuestExists!.done = true;
          miniQuestExists!.status = "done";

          await miniQuestExists.save();

          res.status(OK).json({ message: "task completed" });
          return;
        }
      }

      res.status(BAD_REQUEST).json({ error: "User has not supported or opposed a claim or shares is less than 0.01" });
      return;
    } else {
      const campaignQuestExists = await campaignQuestCompleted.findOne({ campaignQuest: id, campaign: questId, user: userToCheck._id });

      if (!campaignQuestExists) {
        if (!supportFound && !opposeFound) {
          await campaignQuestCompleted.create({ campaignQuest: id, campaign: questId, done: false, status: "retry", user: userToCheck._id });
        } else {
          await campaignQuestCompleted.create({ campaignQuest: id, campaign: questId, done: true, status: "done", user: userToCheck._id });

          res.status(OK).json({ message: "task completed" });
          return;
        }
      } else {
        if (!supportFound && !opposeFound) {
          campaignQuestExists.done = false;
          campaignQuestExists.status = "retry";

          await campaignQuestExists!.save();
        } else {
          campaignQuestExists!.done = true;
          campaignQuestExists!.status = "done";

          await campaignQuestExists.save();

          res.status(OK).json({ message: "task completed" });
          return;
        }
      }

      res.status(BAD_REQUEST).json({ error: "User has not supported or opposed a claim or shares is less than 0.01" });
    }
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error validating portal task" });
  }
}

export const getAnalytics = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userFound = await user.find().select("updatedAt createdAt refRewardClaimed badges status").lean();
    const totalReferrals = await referredUsers.countDocuments();

    const totalCampaigns = await campaign.countDocuments();
    const totalQuests = await quest.countDocuments({ category: "weekly" });

    const totalQuestsCompleted = await questCompleted.countDocuments({
      done: true,
    });

    const totalCampaignsCompletedFound = await campaignCompleted.find().select("campaignCompleted questsCompleted").lean();

    const totalCampaignsCompleted = totalCampaignsCompletedFound.filter(c => c.campaignCompleted === true).length;

    const joinRatio = (totalCampaignsCompleted / totalCampaignsCompletedFound.length) * 100;

    const totalUsers = userFound.length;

    const now = new Date();

    const users24h = userFound.filter((u) => {

      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      return u.createdAt >= last24Hours;
    }).length;

    const referralRewardsClaimed = userFound.filter((u: { refRewardClaimed?: boolean | null }) => {
      return u.refRewardClaimed === true;
    }).length;

    const nexonsMinted = userFound.filter((u: { badges: number[] }) => {
      return u.badges.length > 0;
    }).length;

    const totalTrustDistributed = (totalCampaignsCompleted * 16) + (referralRewardsClaimed * 16.2); // fix this later

    const totalQuestClaims = totalQuestsCompleted * 3;

    const totalCampaignClaims = totalCampaignsCompleted * 2;

    const totalOnchainClaims = totalQuestClaims + totalCampaignClaims;

    const totalOnchainInteractions = totalOnchainClaims + referralRewardsClaimed + nexonsMinted;

    const users7d = userFound.filter((u) => {

      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      return u.createdAt >= last7Days;
    }).length;

    const users30d = userFound.filter((u) => {

      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return u.createdAt >= last30Days;
    }).length;

    const activeUsersWeekly = userFound.filter((u: { updatedAt: Date, status: string }) => {

      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      return u.status === "Active" && u.updatedAt >= last7Days;
    }).length;

    const activeUsersMonthly = userFound.filter((u: { updatedAt: Date, status: string }) => {

      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return u.status === "Active" && u.updatedAt >= last30Days;
    }).length;

    res.status(OK).json({ message: "analytics data fetched", analytics: { totalOnchainInteractions, totalOnchainClaims, totalCampaigns, user: { totalUsers, activeUsersWeekly, activeUsersMonthly, users24h, users7d, users30d }, totalReferrals, totalQuests, totalQuestsCompleted, totalCampaignsCompleted, joinRatio, totalTrustDistributed } });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching analytics data" });
  }
}

export const performDailySignIn = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const userId = req.id;

    const today = startOfDayUTC();

    const yesterday = new Date(today);

    yesterday.setUTCDate(today.getUTCDate() - 1);

    const userExists = await user.findById(userId);
    if (!userExists) {
      res.status(NOT_FOUND).json({ message: "User not found" });
      return;
    }

    const onlyDate = today.toISOString().split("T")[0];
    const yesterdayDate = yesterday.toISOString().split("T")[0];

    const dailySignInExists = await dailySignIn.findOne({ user: req.id });
    if (!dailySignInExists) {
      await dailySignIn.create({ user: req.id, date: onlyDate });

      userExists.lastSignInDate = onlyDate;
      userExists.xp += 20;
      userExists.streak += 1;
      
      // Update longest streak if current streak is higher
      if (userExists.streak > (userExists.longestStreak || 0)) {
        userExists.longestStreak = userExists.streak;
      }

      await userExists.save();

      res.status(OK).json({ message: "performed daily sign in" });
      return;
    }

    if (onlyDate === dailySignInExists.date) {
      res.status(BAD_REQUEST).json({ error: "Already signed in today" });
      return;
    }

    // 🔥 Streak logic
    if (dailySignInExists.date === yesterdayDate) {
      userExists.xp += 20;
      userExists.streak += 1;
      
      // Update longest streak if current streak is higher
      if (userExists.streak > (userExists.longestStreak || 0)) {
        userExists.longestStreak = userExists.streak;
      }
    } else {
      userExists.streak = 1;
      userExists.xp += 20;
    }

    dailySignInExists.date = onlyDate as string;

    userExists.lastSignInDate = onlyDate;

    await userExists.save();
    await dailySignInExists.save();

    res.json({ message: "Daily sign-in successful", done: true });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error claiming daily quest" })
  }
}

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
    referrer.refRewardClaimed = true;

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

  const timers = await timer.find();
  const timeToWait = timers[0];

  let xClient: Client;
  let quest: any | undefined = undefined;

  try {
    const { tag, id: postId, questId, page } = req.body; // get task id and store project x id, then remove hardcoded nexura id

    const NEXURA_ID = "1983300499597393920";
    const NEXURA_USERNAME = "NexuraXYZ";
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

        const followersArr = [];
        let followDone = false;
        let followCursor = "";

        const followKey = `${NEXURA_USERNAME}:follow`;

        const followersInCache = await REDIS.get(followKey);

        const followFound = followersInCache.some((follower: { id: string }) => follower.id === xId);
        if (followFound) {
          res.status(OK).json({ message: "task verified", success: true });
          return;
        }

        if (followersInCache.length < 500) {
          const now = new Date();

          if (timeToWait?.time != null && timeToWait.time > now) {
            res.status(UNAUTHORIZED).json({ error: "task has not been validated, check back after 1 hr" });
            return;
          }

          while (!followDone) {
            const { data: { followers, has_next_page, next_cursor } } = await axios.get(`${API_URL}/user/followers?userName=${NEXURA_USERNAME}&pageSize=200&cursor=${followCursor}`, {
              headers: {
                "X-API-Key": `${THIRD_PARTY_API_KEY}`,
              }
            });

            if (followersArr.length === 500 || followers.length === 0) {
              followDone = true;
              await REDIS.set({ key: followKey, data: followersArr });
            } else {
              followersArr.push(...followers);
              followCursor = next_cursor;
              if (!has_next_page) {
                followDone = true;
                await REDIS.set({ key: followKey, data: followersArr });
              }
            }
          }

          if (!timeToWait) { 
            await timer.create({ time: new Date(now.getTime() + 1 * 60 * 60 * 1000) }); 
          } else {
            timeToWait.time = new Date(now.getTime() + 1 * 60 * 60 * 1000);
            await timeToWait.save();
          }
        }

        followDone = false;
        followCursor = "";

        const isFollowing = followersArr.some((follower: { id: string }) => follower.id === xId);

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
        return;
      case "repost":

        const repostersArr = [];
        let repostDone = false;
        let repostCursor = "";

        const repostKey = `${postId}:repost`;

        const repostInCache = await REDIS.get(repostKey);

        const repostFound = repostInCache.some((reposter: { id: string }) => reposter.id === xId);
        if (repostFound) {
          res.status(OK).json({ message: "task verified", success: true });
          return;
        }

        if (repostInCache.length < 500) {
          const now = new Date();

          if (timeToWait?.time != null && timeToWait.time > now) {
            res.status(UNAUTHORIZED).json({ error: "task has not been validated, check back after 1 hr" });
            return;
          }

          while (!repostDone) {
            const { data: { users, has_next_page, next_cursor } } = await axios.get(`${API_URL}/tweet/retweeters?tweetId=${postId}&cursor=${repostCursor}`, {
              headers: {
                "X-API-Key": `${THIRD_PARTY_API_KEY}`,
              }
            });

            if (repostersArr.length >= 500 || users.length === 0) {
              repostDone = true;
              await REDIS.set({ key: repostKey, data: repostersArr });
            } else {
              repostersArr.push(...users);
              repostCursor = next_cursor;
              if (!has_next_page) {
                repostDone = true;
                await REDIS.set({ key: repostKey, data: repostersArr });
              }
            }
          }

          if (!timeToWait) { 
            await timer.create({ time: "" }); 
          } else {
            timeToWait.time = new Date(now.getTime() + 1 * 60 * 60 * 1000);
            await timeToWait.save();
          }
        }

        repostDone = false;
        repostCursor = "";

        const hasReposted = repostersArr.some((reposter: { id: string }) => reposter.id === xId);

        if (!hasReposted) {
          res.status(BAD_REQUEST).json({ error: "tweet not reposted" });
          return;
        }

        res.status(OK).json({ message: "task verified", success: true });

        return
      case "comment":
        const commentsArr = [];
        let commentDone = false;
        let commentCursor = "";

        const commentKey = `${postId}:comments`;

        const commentsInCache = await REDIS.get(commentKey);

        const commentFound = commentsInCache.some((reply: { author: { id: string } }) => reply.author.id === xId);
        if (commentFound) {
          res.status(OK).json({ message: "task verified", success: true });
          return;
        }

        if (commentsInCache.length < 500) {
          const now = new Date();

          if (timeToWait?.time != null && timeToWait.time > now) {
            res.status(UNAUTHORIZED).json({ error: "task has not been validated, check back after 1 hr" });
            return;
          }

          while (!commentDone) {
            const { data: { tweets, has_next_page, next_cursor } } = await axios.get(`${API_URL}/tweet/replies?tweetId=${postId}&cursor=${commentCursor}`, {
              headers: {
                "X-API-Key": `${THIRD_PARTY_API_KEY}`,
              }
            });

            if (commentsArr.length >= 500 || tweets.length === 0) {
              commentDone = true;
              await REDIS.set({ key: commentKey, data: commentsArr });
            } else {
              commentsArr.push(...tweets);
              commentCursor = next_cursor;
              if (!has_next_page) {
                commentDone = true;
                await REDIS.set({ key: commentKey, data: commentsArr });
              }
            }
          }

          if (!timeToWait) { 
            await timer.create({ time: "" }); 
          } else {
            timeToWait.time = new Date(now.getTime() + 1 * 60 * 60 * 1000);
            await timeToWait.save();
          }
        }

        commentDone = false;
        commentCursor = "";

        const hasReplied = commentsArr.some((reply: { author: { id: string } }) => reply.author.id === xId);

        if (!hasReplied) {
          res.status(BAD_REQUEST).json({ error: "tweet not commented on/task retry again" });
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

    const now = new Date();

    const xAlreadyUsed = await user.findOne({ "socialProfiles.x.id": x_id });
    if (xAlreadyUsed && xAlreadyUsed._id !== userToUpdate._id) {
      if (xAlreadyUsed.socialProfiles?.x?.connected) {
        res.status(BAD_REQUEST).json({ error: "x account already connected to another user" });
        return;
      }

      const disconnectedAt = xAlreadyUsed.socialProfiles?.x?.disconnectedAt;
      if (disconnectedAt) {
        if (now < disconnectedAt) {
          res.status(BAD_REQUEST).json({ error: "x account disconnected recently, try again after 3 days. Try connecting another account" });
          return;
        }
      }

      const userToken = await token.findOne({ userId: x_id });
      if (!userToken) {
        res.status(BAD_REQUEST).json({ error: "no access token or refresh token found, please connect x again" });
        return;
      }

      xAlreadyUsed!.socialProfiles!.x = { connected: false, id: "", username: "" };

      userToUpdate!.socialProfiles!.x = { connected: true, id: x_id, username };

      await userToUpdate.save();
      await xAlreadyUsed.save();

      res.status(OK).json({ message: "connected!", user: userToUpdate });
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

    const now = new Date();

    const discordAlreadyUsed = await user.findOne({ "socialProfiles.discord.id": discord_id });
    if (discordAlreadyUsed && discordAlreadyUsed._id !== userToUpdate._id) {
      if (discordAlreadyUsed.socialProfiles?.discord?.connected) {
        res.status(BAD_REQUEST).json({ error: "discord account already connected to another user" });
        return;
      }

      const disconnectedAt = discordAlreadyUsed.socialProfiles?.discord?.disconnectedAt;
      if (disconnectedAt) {
        if (now < disconnectedAt) {
          res.status(BAD_REQUEST).json({ error: "discord account disconnected recently, try again after 3 days. Try connecting another account" });
          return;
        }
      }

      discordAlreadyUsed!.socialProfiles!.discord = { connected: false, id: "", username: "" };

      userToUpdate!.socialProfiles!.discord = { connected: true, id: discord_id, username };

      await userToUpdate.save();
      await discordAlreadyUsed.save();

      res.status(OK).json({ message: "connected!", user: userToUpdate });
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
    const { guildId, tag, campaignId, id } = req.body;

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

    const completed = await campaignQuestCompleted.findOne({ user: req.id, campaignQuest: id, campaign: campaignId });
    if (completed?.done) {
      res.status(BAD_REQUEST).json({ error: "user has already completed the task" });
      return
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
          if (!completed) {
            await campaignQuestCompleted.create({ user: req.id, status: "retry", campaign: campaignId, campaignQuest: id });
          } else {
            completed.status = "retry";

            await completed.save();
          }

          res.status(BAD_REQUEST).json({ error: "join the discord server and get verified" });
          return;
        }

        if (!roles.includes("1439591151081492593")) { // verfied id
          if (!completed) {
            await campaignQuestCompleted.create({ user: req.id, status: "retry", campaign: campaignId, campaignQuest: id });
          } else {
            completed.status = "retry";

            await completed.save();
          }

          res.status(BAD_REQUEST).json({ error: "you need to be verified to continue" });
          return;
        }

        if (!completed) {
          await campaignQuestCompleted.create({ user: req.id, campaign: campaignId, campaignQuest: id });
        } else {
          completed.status = "pending";

          await completed.save();
        }

        res.status(OK).json({ message: "validated", success: true });

        return;
      case "message":
        const sentMessage = await firstMessage.findOne({ user_id: discordId });
        if (!sentMessage) {
          if (!completed) {
            await campaignQuestCompleted.create({ user: req.id, status: "retry", campaign: campaignId, campaignQuest: id });
          } else {
            completed.status = "retry";

            await completed.save();
          }

          res.status(BAD_REQUEST).json({ error: "send a message to the server to continue" });
          return;
        }

        if (!completed) {
          await campaignQuestCompleted.create({ user: req.id, campaign: campaignId, campaignQuest: id });
        } else {
          completed.status = "pending";

          await completed.save();
        }

        res.status(OK).json({ message: "user has sent message", success: true });

        return;
    }
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error checking discord task" })
  }
}
