const FALLBACK_ERROR = "Something went wrong. Please try again.";

const RULES: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /(insufficient funds|insufficient balance|insufficient trust|sendtherequiredfeeamount|send the required fee amount)/i, message: "Insufficient funds." },
  { pattern: /(user rejected|user denied|rejected the request|action_rejected|transaction rejected|request rejected)/i, message: "Transaction canceled." },
  { pattern: /(already joined campaign|already joined)/i, message: "You already joined this campaign." },
  { pattern: /(already in use|already exists|email is already in use|name is already in use)/i, message: "This is already in use." },
  { pattern: /(jwt|unauthorized|invalid token|token expired|401)/i, message: "Please sign in and try again." },
  { pattern: /(no wallet provider|wallet not connected|connect a wallet)/i, message: "Please connect your wallet to continue." },
  { pattern: /(failed to fetch|networkerror|network request failed|econnrefused|load failed)/i, message: "Network error. Please try again." },
  { pattern: /(campaign has ended)/i, message: "This campaign has ended." },
  { pattern: /(campaignisalreadyclosed|campaign is already closed)/i, message: "The rewards contract has already been closed." },
  { pattern: /(onlythecampaigncreatorcancallthis|only the campaign creator can call this)/i, message: "Only the campaign creator can withdraw the remaining rewards." },
  { pattern: /(newdateissupposedtobegreaterthanolddate|new date is supposed to be greater than old date)/i, message: "Set a later campaign start date before updating the rewards contract." },
  { pattern: /(cannot be reopened because its remaining funds have already been withdrawn|cannot be extended because its remaining funds have already been withdrawn)/i, message: "This rewards contract has already been settled and cannot be reopened." },
  { pattern: /(failedtorefundreward|failed to refund reward)/i, message: "The contract could not return the remaining rewards." },
  { pattern: /(campaign has not started yet)/i, message: "This campaign has not started yet." },
  { pattern: /(alreadycreatedsixcampaigns)/i, message: "You have reached the campaign creation limit." },
  { pattern: /(alreadyclaimedcampaignreward|alreadyclaimed)/i, message: "Reward already claimed." },
  { pattern: /(rewardhasbeenexhausted|reward exhausted)/i, message: "Rewards are currently exhausted." },
  { pattern: /(completecampaigntoclaimreward)/i, message: "Complete the campaign before claiming reward." },
  { pattern: /(campaigncanonlybecreatedonce)/i, message: "This campaign can only be created once." },
];

const getRawErrorText = (input: unknown): string => {
  if (typeof input === "string") return input.trim();
  if (input instanceof Error) return String(input.message ?? "").trim();
  if (input && typeof input === "object" && "message" in input) {
    const candidate = (input as { message?: unknown }).message;
    if (typeof candidate === "string") return candidate.trim();
  }
  return "";
};

export const toUserFriendlyErrorMessage = (input: unknown, fallback: string = FALLBACK_ERROR): string => {
  const raw = getRawErrorText(input);
  if (!raw) return fallback;

  for (const rule of RULES) {
    if (rule.pattern.test(raw)) return rule.message;
  }

  const withoutRevertPrefix = raw
    .replace(/execution reverted:?/gi, "")
    .replace(/error:\s*/gi, "")
    .trim();

  if (!withoutRevertPrefix) return fallback;

  if (withoutRevertPrefix.length > 120) {
    return fallback;
  }

  return withoutRevertPrefix;
};

export const toUserFriendlyError = (input: unknown, fallback?: string): Error => {
  return new Error(toUserFriendlyErrorMessage(input, fallback));
};
