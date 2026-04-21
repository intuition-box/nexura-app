import { useEffect, useState } from "react";
import { X, Loader2, Check, ArrowRight, ArrowLeft, FileText, Share2, Download, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { createProofOfAction } from "../services/web3";
import { useToast } from "../hooks/use-toast";
import { toUserFriendlyErrorMessage } from "../lib/errorMessages";
import { getPublicClient } from "../lib/viem";
import { formatEther } from "viem";
import { getLevelProgress } from "../lib/levels";
import subjectAvatarImg from "../assets/proof-modal/subject-avatar.png";
import predicateCheckImg from "../assets/proof-modal/predicate-check.png";
import learnIconImg from "../assets/proof-modal/learn-icon.png";
import questIconImg from "../assets/proof-modal/quest-icon.png";
import campaignIconImg from "../assets/proof-modal/campaign-icon.png";
import ecosystemIconImg from "../assets/proof-modal/ecosystem-icon.png";
import infoSubjectImg from "../assets/proof-modal/info-subject.svg";
import infoPredicateImg from "../assets/proof-modal/info-predicate.svg";
import infoObjectImg from "../assets/proof-modal/info-object.svg";

interface ProofOfActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  object: string;
  xpReward?: number | string;
  stakeTrust?: string;
  stakeUsd?: string;
  onSuccess: (txHash: string) => Promise<void> | void;
  sourceLabel?: string;
  alreadyClaimed?: boolean;
  userXp?: number;
}

const SUBJECT = "I";

function resolveObjectIcon(sourceLabel?: string): string {
  const key = (sourceLabel || "").toLowerCase();
  if (key.includes("quest")) return questIconImg;
  if (key.includes("campaign")) return campaignIconImg;
  if (key.includes("ecosystem") || key.includes("dapp")) return ecosystemIconImg;
  return learnIconImg;
}

function resolvePredicate(sourceLabel?: string): string {
  const key = (sourceLabel || "").toLowerCase();
  if (key.includes("ecosystem") || key.includes("dapp")) return "Explored";
  return "Completed";
}

export default function ProofOfActionModal({
  open,
  onOpenChange,
  object,
  xpReward,
  stakeTrust = "0.10",
  stakeUsd,
  onSuccess,
  sourceLabel,
  alreadyClaimed = false,
  userXp = 0,
}: ProofOfActionModalProps) {
  const { toast } = useToast();
  const [staking, setStaking] = useState(false);
  const [staked, setStaked] = useState(alreadyClaimed);
  const [txHash, setTxHash] = useState<string>("");
  const [networkFee, setNetworkFee] = useState<string>("");
  const [stakeInput, setStakeInput] = useState<string>(stakeTrust);

  useEffect(() => {
    if (!open) {
      setStaking(false);
      setStaked(alreadyClaimed);
      setTxHash("");
      setNetworkFee("");
      setStakeInput(stakeTrust);
    }
  }, [open, alreadyClaimed, stakeTrust]);

  useEffect(() => {
    if (alreadyClaimed) setStaked(true);
  }, [alreadyClaimed]);

  const objectName = object?.trim();
  const objectLabel = objectName ? `${objectName} on Nexura` : "this action on Nexura";
  const predicateLabel = resolvePredicate(sourceLabel);
  const objectIcon = resolveObjectIcon(sourceLabel);

  const MIN_STAKE = 0.1;
  const parsedStake = Number(stakeInput);
  const stakeValid = Number.isFinite(parsedStake) && parsedStake >= MIN_STAKE;

  const handleStake = async () => {
    if (staking || staked || alreadyClaimed) return;
    if (!objectName) {
      toast({
        title: "Stake failed",
        description: "Missing action context. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (!stakeValid) {
      toast({
        title: "Invalid deposit",
        description: `Minimum deposit is ${MIN_STAKE} $TRUST.`,
        variant: "destructive",
      });
      return;
    }

    setStaking(true);

    try {
      const hash = await createProofOfAction({
        subjectString: SUBJECT,
        predicateString: predicateLabel,
        objectString: objectLabel,
        stakeTrust: parsedStake.toString(),
      });
      setTxHash(hash);
      setStaked(true);
      try {
        const publicClient = getPublicClient();
        const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
        const feeWei = receipt.gasUsed * receipt.effectiveGasPrice;
        setNetworkFee(formatEther(feeWei));
      } catch {
        // Best-effort: leave blank if receipt lookup fails.
      }
      await onSuccess(hash);
      toast({
        title: "Proof of Action staked",
        description: "Your XP has been claimed.",
      });
    } catch (err: unknown) {
      toast({
        title: "Stake failed",
        description: toUserFriendlyErrorMessage(err, "Unable to stake Proof of Action."),
        variant: "destructive",
      });
    } finally {
      setStaking(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && staking) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose
        className="p-0 border-0 bg-transparent shadow-none w-[calc(100vw-32px)] max-w-[897px] sm:w-[897px] !duration-500 data-[state=open]:!zoom-in-90 data-[state=open]:!slide-in-from-bottom-8 data-[state=closed]:!zoom-out-95 data-[state=closed]:!slide-out-to-bottom-4"
      >
        <div
          className="relative overflow-hidden rounded-[28px] sm:rounded-[40px]"
          style={{
            background: `
              radial-gradient(circle at 80% 10%, rgba(60, 0, 100, 0.25) 0%, transparent 45%),
              radial-gradient(circle at 20% 90%, rgba(35, 0, 70, 0.22) 0%, transparent 60%),
              linear-gradient(135deg, #0a0514 0%, #05020d 100%)
            `,
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <button
            onClick={() => handleOpenChange(false)}
            className="absolute top-[25px] right-[25px] w-[34px] h-[34px] flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
            aria-label="Close"
            data-testid="proof-modal-close"
          >
            <X className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>

          {staked ? (
            <SuccessView
              xpReward={xpReward}
              txHash={txHash}
              onDismiss={() => handleOpenChange(false)}
              networkFeeEth={networkFee}
              userXp={userXp}
            />
          ) : (
          <div className="px-[28px] pt-[24px] pb-[26px]">
            <h2
              className="text-[#e0e2ea] font-bold text-[22px] sm:text-[24px] leading-[28px] tracking-[-0.8px] animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms", animationFillMode: "both" }}
            >
              Proof of Action
            </h2>

            <p
              className="text-[#cdc2d8] text-[12px] sm:text-[13px] font-medium leading-[18px] mt-0.5 max-w-[501px] animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "140ms", animationFillMode: "both" }}
            >
              Create a structured claim using semantic triples to prove task completion. The system validates your claim after staking. Only valid claims unlock XP rewards.
            </p>

            <div className="mt-4 flex flex-col lg:flex-row gap-4 lg:gap-[40px] lg:items-stretch">
              <div className="flex-1 min-w-0 space-y-3">
                <div
                  className="animate-in fade-in slide-in-from-left-4 duration-500"
                  style={{ animationDelay: "220ms", animationFillMode: "both" }}
                >
                  <TripleField
                    label="SUBJECT"
                    labelColor="#8b3efe"
                    borderColor="#8b3efe"
                    infoIcon={infoSubjectImg}
                    avatarType="image"
                    avatarSrc={subjectAvatarImg}
                    value={SUBJECT}
                  />
                </div>
                <div
                  className="animate-in fade-in slide-in-from-left-4 duration-500"
                  style={{ animationDelay: "300ms", animationFillMode: "both" }}
                >
                  <TripleField
                    label="PREDICATE"
                    labelColor="#b65fc8"
                    borderColor="#b65fc8"
                    infoIcon={infoPredicateImg}
                    avatarType="check"
                    avatarSrc={predicateCheckImg}
                    value={predicateLabel}
                  />
                </div>
                <div
                  className="animate-in fade-in slide-in-from-left-4 duration-500"
                  style={{ animationDelay: "380ms", animationFillMode: "both" }}
                >
                  <TripleField
                    label="OBJECT"
                    labelColor="#00e1a2"
                    borderColor="#00e1a2"
                    infoIcon={infoObjectImg}
                    avatarType="icon"
                    avatarSrc={objectIcon}
                    value={objectLabel}
                  />
                </div>
              </div>

              <div
                className="w-full lg:w-[309px] shrink-0 animate-in fade-in slide-in-from-right-4 duration-500"
                style={{ animationDelay: "260ms", animationFillMode: "both" }}
              >
                <div className="bg-[#1C0E3480] border border-white/10 rounded-2xl p-4 space-y-3 h-full flex flex-col">
                  <div>
                    <h3 className="text-[#e0e2ea] font-semibold text-[15px] leading-[20px]">
                      Stake on this Claim
                    </h3>
                    <p className="text-[#cdc2d8] text-[11px] leading-[15px] mt-1">
                      Support this claim with measurable $TRUST value.
                    </p>
                  </div>

                  <div className="h-px bg-[#393b60]" />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(255,255,255,0.6)] text-[10px] font-bold tracking-[1px] uppercase">
                        Initial Deposit
                      </span>
                      <span className="text-[rgba(255,255,255,0.6)] text-[11px] font-semibold">
                        min {MIN_STAKE}
                      </span>
                    </div>
                    <div className={`bg-[rgba(6,2,16,0.6)] border rounded-xl h-[32px] px-[12px] flex items-center justify-between transition-colors ${stakeValid ? "border-[rgba(131,58,253,0.5)]" : "border-[rgba(239,68,68,0.6)]"}`}>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={MIN_STAKE}
                        step="0.01"
                        value={stakeInput}
                        onChange={(e) => setStakeInput(e.target.value)}
                        disabled={staking || staked}
                        aria-label="Deposit amount in TRUST"
                        className="flex-1 bg-transparent outline-none text-[rgba(255,255,255,0.85)] text-[12px] font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-60"
                      />
                      <span className="text-[rgba(255,255,255,0.42)] text-[11px] font-semibold ml-2">
                        $TRUST
                      </span>
                    </div>
                    {!stakeValid && (
                      <p className="text-[10px] text-[#ff6b6b] font-medium">
                        Minimum {MIN_STAKE} $TRUST
                      </p>
                    )}
                  </div>

                  <div className="bg-[rgba(6,2,16,0.6)] border border-[rgba(131,58,253,0.5)] rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[#e0e2ea] text-[13px] font-bold leading-[18px]">
                          Total
                        </span>
                        <p className="text-[rgba(255,255,255,0.42)] text-[10px] leading-[14px] mt-0.5">
                          + network gas
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[#d4bbff] text-[13px] font-bold leading-[18px]">
                          {stakeValid ? parsedStake : stakeInput || 0} $TRUST
                        </div>
                        {stakeUsd ? (
                          <div className="text-[#968da1] text-[9px] leading-[12px]">
                            &asymp; {stakeUsd} USD
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {typeof xpReward !== "undefined" && (
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#00e1a2] font-semibold animate-in fade-in duration-500" style={{ animationDelay: "520ms", animationFillMode: "both" }}>
                      <span>Unlocks +{xpReward} XP</span>
                    </div>
                  )}

                  <button
                    onClick={handleStake}
                    disabled={staking || staked || !stakeValid}
                    data-testid="proof-modal-deposit"
                    className={`w-full h-[38px] rounded-[100px] font-semibold text-[13px] flex items-center justify-center gap-2 mt-auto relative overflow-hidden transition-all duration-300 ease-out ${
                      staked
                        ? "bg-[#00e1a2] text-black shadow-[0_0_24px_rgba(0,225,162,0.45)]"
                        : staking
                          ? "bg-white/70 text-black/70 cursor-wait"
                          : "bg-white text-black hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_22px_rgba(139,62,254,0.45)] active:scale-[0.97]"
                    }`}
                  >
                    {staking && !staked && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                    )}
                    {staked ? (
                      <span className="flex items-center gap-2 animate-in zoom-in-50 fade-in duration-300">
                        <Check className="w-4 h-4" strokeWidth={3} />
                        Claimed
                      </span>
                    ) : staking ? (
                      <span className="flex items-center gap-2 relative z-10">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Staking…
                      </span>
                    ) : (
                      <span className="relative z-10">Deposit</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SuccessViewProps {
  xpReward?: number | string;
  txHash: string;
  onDismiss: () => void;
  networkFeeEth?: string;
  userXp?: number;
}

function formatClaimId(hash: string): string {
  const cleaned = (hash || "").replace(/^0x/, "").toUpperCase();
  if (cleaned.length < 6) return "NEX-0000-00";
  return `NEX-${cleaned.slice(0, 4)}-${cleaned.slice(-2)}`;
}

function formatNetworkFee(feeEth: string): string {
  if (!feeEth) return "—";
  const n = Number(feeEth);
  if (!Number.isFinite(n) || n === 0) return "—";
  if (n < 0.00001) return `${n.toExponential(2)} TRUST`;
  return `${n.toFixed(6)} TRUST`;
}

function SuccessView({ xpReward, txHash, onDismiss, networkFeeEth, userXp = 0 }: SuccessViewProps) {
  const xpAmount = typeof xpReward !== "undefined" ? String(xpReward) : "0";
  const claimId = formatClaimId(txHash);
  const rewardXp = Number(xpReward) || 0;
  const totalXpAfter = userXp + rewardXp;
  const levelProgress = getLevelProgress(totalXpAfter);
  const nextLevelName = levelProgress.next?.name ?? levelProgress.current.name;

  return (
    <div className="px-[28px] sm:px-[34px] pt-[28px] pb-[24px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div
          className="lg:col-span-8 relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-[rgba(212,187,255,0.1)] bg-[rgba(28,32,37,0.6)] backdrop-blur-[10px] shadow-[0_0_40px_0_rgba(138,63,252,0.1)] p-8 sm:p-10 flex flex-col items-center justify-center min-h-[480px] animate-in fade-in zoom-in-95 duration-500"
          style={{ animationFillMode: "both" }}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,187,255,0.22) 0%, transparent 70%)" }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <div
              className="w-[96px] h-[96px] rounded-[24px] bg-[rgba(0,225,162,0.1)] border border-[rgba(0,225,162,0.3)] flex items-center justify-center animate-in zoom-in-50 fade-in duration-500"
              style={{ animationDelay: "120ms", animationFillMode: "both" }}
            >
              <Check className="w-10 h-10 text-[#00e1a2]" strokeWidth={3} />
            </div>

            <h2
              className="mt-8 font-bold text-[34px] sm:text-[44px] lg:text-[48px] text-white text-center leading-[1.05] tracking-[-1.2px] animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "220ms", animationFillMode: "both" }}
            >
              Claim Created
              <br />
              Successfully
            </h2>

            <p
              className="mt-5 text-[#94a3b8] text-[15px] sm:text-[17px] text-center leading-[26px] max-w-[448px] animate-in fade-in duration-500"
              style={{ animationDelay: "320ms", animationFillMode: "both" }}
            >
              Your onchain claim has been verified and recorded on the Nexura Network. Your rewards are ready to be harvested.
            </p>

            <div
              className="mt-8 flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 duration-500"
              style={{ animationDelay: "420ms", animationFillMode: "both" }}
            >
              <span className="text-[#64748b] text-[14px] font-bold tracking-[1.6px] uppercase">
                Unclaimed Balance
              </span>
              <div className="flex items-end gap-2">
                <span
                  className="text-[#d4bbff] text-[56px] sm:text-[64px] lg:text-[72px] font-bold leading-none"
                  style={{ textShadow: "0 0 15px rgba(212,187,255,0.5)" }}
                >
                  +{xpAmount}
                </span>
                <span className="text-[#94e2ff] text-[22px] sm:text-[24px] font-bold mb-2">XP</span>
              </div>
            </div>

            <button
              onClick={onDismiss}
              data-testid="proof-success-claim-cta"
              className="mt-8 px-10 py-[18px] rounded-[100px] font-bold text-[16px] sm:text-[18px] text-[#270058] bg-gradient-to-r from-[#8a3ffc] to-[#00ccf9] flex items-center gap-3 hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(138,63,252,0.55)] active:scale-[0.98] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "540ms", animationFillMode: "both" }}
            >
              Claim XP Rewards
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5">
          <div
            className="rounded-[24px] sm:rounded-[28px] border border-[rgba(212,187,255,0.1)] border-l-4 border-l-[#d4bbff] bg-[rgba(28,32,37,0.6)] backdrop-blur-[10px] p-6 animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "360ms", animationFillMode: "both" }}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
              <h3 className="text-white font-bold text-[17px]">Claim Summary</h3>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#94a3b8] text-[10px] tracking-[1px] uppercase">Claim ID</span>
                <span className="font-mono text-[#cdc2d8] text-[12px]">{claimId}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#94a3b8] text-[10px] tracking-[1px] uppercase">Status</span>
                <span className="bg-[rgba(0,225,162,0.1)] text-[#00e1a2] text-[10px] font-semibold uppercase tracking-[-0.5px] px-2 py-1 rounded-[4px]">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#94a3b8] text-[10px] tracking-[1px] uppercase">Network Fee</span>
                <span className="text-[#cdc2d8] text-[12px]">{formatNetworkFee(networkFeeEth || "")}</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-[24px] sm:rounded-[28px] border border-[rgba(212,187,255,0.1)] bg-[rgba(28,32,37,0.6)] backdrop-blur-[10px] p-6 relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "460ms", animationFillMode: "both" }}
          >
            <Sparkles className="absolute -bottom-3 -right-3 w-16 h-16 text-white/5" strokeWidth={1} />
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-[#94a3b8] text-[10px] tracking-[1px] uppercase block mb-1">
                  {levelProgress.next ? "Next Level" : "Current Level"}
                </span>
                <span className="text-white font-bold text-[16px]">{nextLevelName}</span>
              </div>
              <span className="text-[#94e2ff] text-[14px] font-bold">{levelProgress.progressPct}%</span>
            </div>
            <div className="bg-[#262a30] h-2 rounded-[12px] overflow-hidden">
              <div
                className="bg-[#94e2ff] h-full rounded-[12px] shadow-[0_0_12px_rgba(148,226,255,0.6)] transition-[width] duration-1000 ease-out"
                style={{ width: `${levelProgress.progressPct}%` }}
              />
            </div>
            <p className="mt-4 text-[#64748b] text-[11px] italic leading-[18px]">
              {levelProgress.next
                ? `${levelProgress.xpRemaining.toLocaleString()} XP remaining until ${levelProgress.next.name} unlocks.`
                : `You've reached the top tier — ${levelProgress.current.name}.`}
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-6 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 px-2 animate-in fade-in duration-500"
        style={{ animationDelay: "620ms", animationFillMode: "both" }}
      >
        <div className="flex gap-6">
          <button className="flex items-center gap-2 text-[#94a3b8] text-[13px] font-medium hover:text-white transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Share Success
          </button>
          <button className="flex items-center gap-2 text-[#94a3b8] text-[13px] font-medium hover:text-white transition-colors">
            <Download className="w-3 h-3" />
            Download Receipt
          </button>
        </div>
        <button
          onClick={onDismiss}
          className="flex items-center gap-2 text-[#64748b] text-[13px] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

interface TripleFieldProps {
  label: string;
  labelColor: string;
  borderColor: string;
  infoIcon: string;
  avatarType: "image" | "check" | "icon";
  avatarSrc: string;
  value: string;
}

function TripleField({
  label,
  labelColor,
  borderColor,
  infoIcon,
  avatarType,
  avatarSrc,
  value,
}: TripleFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[11px] font-semibold tracking-[1px] uppercase leading-[14px]"
          style={{ color: labelColor }}
        >
          {label}
        </span>
        <img src={infoIcon} alt="" className="w-[12px] h-[12px] opacity-80" />
      </div>
      <div
        className="flex items-center gap-[12px] bg-[rgba(10,14,19,0.7)] rounded-[12px] px-[10px] py-[5px] h-[40px]"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <TripleAvatar type={avatarType} src={avatarSrc} />
        <p className="text-white text-[13px] font-semibold leading-normal truncate flex-1 min-w-0">
          {value}
        </p>
      </div>
    </div>
  );
}

interface TripleAvatarProps {
  type: "image" | "check" | "icon";
  src: string;
}

function TripleAvatar({ type, src }: TripleAvatarProps) {
  if (type === "image") {
    return (
      <div className="w-[32px] h-[32px] rounded-[90px] border-[0.2px] border-white/40 overflow-hidden flex-shrink-0">
        <img src={src} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  if (type === "check") {
    return (
      <div className="w-[32px] h-[32px] rounded-[40px] bg-[#0d0d0d] border-[0.2px] border-white/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src={src} alt="" className="w-[16px] h-[16px] object-contain" />
      </div>
    );
  }
  return (
    <div className="w-[32px] h-[32px] rounded-[40px] bg-[#0d0d0d] border-[0.2px] border-white/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
      <img src={src} alt="" className="w-[18px] h-[18px] object-contain" />
    </div>
  );
}
