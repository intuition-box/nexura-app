// Task type definitions for Nexura Studio campaign builder

export const TASK_CATEGORIES = {
  DISCORD: 'discord',
  TWITTER: 'twitter',
  ONCHAIN: 'onchain',
  TELEGRAM: 'telegram',
  POH: 'poh',
  QUIZ: 'quiz',
  EMAIL: 'email',
} as const;

export type TaskCategory = typeof TASK_CATEGORIES[keyof typeof TASK_CATEGORIES];

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  discord: 'Discord',
  twitter: 'Twitter',
  onchain: 'On-Chain',
  telegram: 'Telegram',
  poh: 'Proof of Humanity',
  quiz: 'Quiz',
  email: 'Email',
};

export const TASK_CATEGORY_ICONS: Record<TaskCategory, string> = {
  discord: '💬',
  twitter: '🐦',
  onchain: '⛓️',
  telegram: '✈️',
  poh: '👤',
  quiz: '❓',
  email: '📧',
};

// Discord task subtypes
export const DISCORD_SUBTYPES = {
  ROLE_CLAIM: 'role-claim',
  JOIN_COMMUNITY: 'join-community',
  INTERACT_CHANNEL: 'interact-channel',
  VERIFY_MEMBER: 'verify-member',
} as const;

export const DISCORD_SUBTYPE_LABELS = {
  'role-claim': 'Claim Role',
  'join-community': 'Join Community',
  'interact-channel': 'Interact in Channel',
  'verify-member': 'Verify Membership',
};

// Twitter task subtypes
export const TWITTER_SUBTYPES = {
  LIKE_POST: 'like-post',
  RETWEET: 'retweet',
  FOLLOW: 'follow',
  QUOTE_TWEET: 'quote-tweet',
  REPLY: 'reply',
} as const;

export const TWITTER_SUBTYPE_LABELS = {
  'like-post': 'Like Post',
  'retweet': 'Retweet',
  'follow': 'Follow Account',
  'quote-tweet': 'Quote Tweet',
  'reply': 'Reply to Tweet',
};

// On-chain task subtypes
export const ONCHAIN_SUBTYPES = {
  TRANSACTION_COUNT: 'transaction-count',
  VERIFY_HOLDINGS: 'verify-holdings',
  NFT_HOLDINGS: 'nft-holdings',
  COMPLETE_TRANSACTION: 'complete-transaction',
  DEPLOY_CONTRACT: 'deploy-contract',
  INTERACT_CONTRACT: 'interact-contract',
} as const;

export const ONCHAIN_SUBTYPE_LABELS = {
  'transaction-count': 'Transaction Count',
  'verify-holdings': 'Verify Token Holdings',
  'nft-holdings': 'Verify NFT Holdings',
  'complete-transaction': 'Complete Transaction',
  'deploy-contract': 'Deploy Contract',
  'interact-contract': 'Interact with Contract',
};

// Telegram task subtypes
export const TELEGRAM_SUBTYPES = {
  CONNECT: 'connect',
  JOIN_GROUP: 'join-group',
  JOIN_CHANNEL: 'join-channel',
  VERIFY_MEMBER: 'verify-member',
} as const;

export const TELEGRAM_SUBTYPE_LABELS = {
  'connect': 'Connect Telegram',
  'join-group': 'Join Group',
  'join-channel': 'Join Channel',
  'verify-member': 'Verify Membership',
};

// Proof of Humanity task subtypes
export const POH_SUBTYPES = {
  AUTHENA: 'authena',
  GITHUB_PASSPORT: 'github-passport',
  GITCOIN_PASSPORT: 'gitcoin-passport',
  WORLDCOIN: 'worldcoin',
  BRIGHTID: 'brightid',
} as const;

export const POH_SUBTYPE_LABELS = {
  'authena': 'Authena Verification',
  'github-passport': 'GitHub Passport',
  'gitcoin-passport': 'Gitcoin Passport',
  'worldcoin': 'WorldCoin',
  'brightid': 'BrightID',
};

// Quiz task subtypes
export const QUIZ_SUBTYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  SHORT_ANSWER: 'short-answer',
  MIXED: 'mixed',
} as const;

export const QUIZ_SUBTYPE_LABELS = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True/False',
  'short-answer': 'Short Answer',
  'mixed': 'Mixed Questions',
};

// Email task subtypes
export const EMAIL_SUBTYPES = {
  SUBMIT_EMAIL: 'submit-email',
  VERIFY_EMAIL: 'verify-email',
  SUBSCRIBE: 'subscribe',
} as const;

export const EMAIL_SUBTYPE_LABELS = {
  'submit-email': 'Submit Email',
  'verify-email': 'Verify Email',
  'subscribe': 'Subscribe to Newsletter',
};

// Combined subtypes mapping
export const TASK_SUBTYPES_BY_CATEGORY: Record<TaskCategory, Record<string, string>> = {
  discord: DISCORD_SUBTYPE_LABELS,
  twitter: TWITTER_SUBTYPE_LABELS,
  onchain: ONCHAIN_SUBTYPE_LABELS,
  telegram: TELEGRAM_SUBTYPE_LABELS,
  poh: POH_SUBTYPE_LABELS,
  quiz: QUIZ_SUBTYPE_LABELS,
  email: EMAIL_SUBTYPE_LABELS,
};

// Verification config interfaces
export interface DiscordVerificationConfig {
  serverId?: string;
  serverInvite?: string;
  roleId?: string;
  channelId?: string;
}

export interface TwitterVerificationConfig {
  tweetUrl?: string;
  accountHandle?: string;
  hashtagRequired?: string;
}

export interface OnChainVerificationConfig {
  chainId?: number;
  contractAddress?: string;
  minTransactions?: number;
  minBalance?: string;
  tokenAddress?: string;
  nftContractAddress?: string;
  minNftCount?: number;
  functionSignature?: string;
}

export interface TelegramVerificationConfig {
  groupId?: string;
  groupInvite?: string;
  channelId?: string;
  channelInvite?: string;
  botUsername?: string;
}

export interface POHVerificationConfig {
  provider: string;
  minScore?: number;
  requiredStamps?: string[];
}

export interface QuizVerificationConfig {
  questions: Array<{
    id: string;
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string | number;
  }>;
  passingScore?: number;
  timeLimit?: number;
}

export interface EmailVerificationConfig {
  requireVerification?: boolean;
  listId?: string;
  tags?: string[];
}

export type TaskVerificationConfig =
  | DiscordVerificationConfig
  | TwitterVerificationConfig
  | OnChainVerificationConfig
  | TelegramVerificationConfig
  | POHVerificationConfig
  | QuizVerificationConfig
  | EmailVerificationConfig;

export interface CampaignTaskData {
  id?: string;
  campaignId: string;
  projectId: string;
  title: string;
  description: string;
  taskCategory: TaskCategory;
  taskSubtype: string;
  xpReward: number;
  verificationConfig: TaskVerificationConfig;
  isActive?: boolean;
  orderIndex?: number;
}
