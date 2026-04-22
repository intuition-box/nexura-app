import { useEffect, useState } from "react";
import { X, Loader2, Check, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { createProofOfAction } from "../services/web3";
import { useToast } from "../hooks/use-toast";
import { toUserFriendlyErrorMessage } from "../lib/errorMessages";
import { getPublicClient } from "../lib/viem";
import { useWallet } from "../hooks/use-wallet";
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
}: ProofOfActionModalProps) {
  const { toast } = useToast();
  const { isConnected, connectWallet, address } = useWallet();
  const [staking, setStaking] = useState(false);
  const [staked, setStaked] = useState(alreadyClaimed);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(alreadyClaimed);
  const [txHash, setTxHash] = useState<string>("");
  const [stakeInput, setStakeInput] = useState<string>(stakeTrust);
  const [walletBalance, setWalletBalance] = useState<bigint>(0n);

  useEffect(() => {
    if (!open) {
      setStaking(false);
      setStaked(alreadyClaimed);
      setClaiming(false);
      setClaimed(alreadyClaimed);
      setTxHash("");
      setStakeInput(stakeTrust);
    }
  }, [open, alreadyClaimed, stakeTrust]);

  useEffect(() => {
    if (!open || !address) return;
    let cancelled = false;
    (async () => {
      try {
        const publicClient = getPublicClient();
        const balance = await publicClient.getBalance({ address: address as `0x${string}` });
        if (!cancelled) setWalletBalance(balance);
      } catch {
        if (!cancelled) setWalletBalance(0n);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, address, txHash]);

  useEffect(() => {
    if (alreadyClaimed) {
      setStaked(true);
      setClaimed(true);
    }
  }, [alreadyClaimed]);

  const objectName = object?.trim();
  const sourceKey = (sourceLabel || "").toLowerCase();
  const isEcosystem = sourceKey.includes("ecosystem") || sourceKey.includes("dapp");
  const objectLabel = !objectName
    ? "this action on Nexura"
    : isEcosystem
      ? objectName
      : `${objectName} on Nexura`;
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
    if (!isConnected) {
      await connectWallet();
      toast({
        title: "Connect your wallet",
        description: "Approve the connection, then tap Create Claim again to stake.",
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
      toast({
        title: "Proof of Action staked",
        description: "Tap Claim XP Rewards to collect your XP.",
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

  const handleClaim = async () => {
    if (claiming || claimed) {
      handleOpenChange(false);
      return;
    }
    setClaiming(true);
    try {
      await onSuccess(txHash);
      setClaimed(true);
      toast({
        title: "XP Claimed",
        description: "Your XP has been added to your balance.",
      });
      handleOpenChange(false);
    } catch (err: unknown) {
      toast({
        title: "Claim failed",
        description: toUserFriendlyErrorMessage(err, "Unable to claim XP."),
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && (staking || claiming)) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose
        onInteractOutside={(e) => { if (staking || claiming || (staked && !claimed)) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (staking || claiming || (staked && !claimed)) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (staking || claiming || (staked && !claimed)) e.preventDefault(); }}
        className={`p-0 border-0 bg-transparent shadow-none w-[calc(100vw-32px)] ${staked ? "max-w-[448px] sm:w-[448px]" : "max-w-[897px] sm:w-[897px]"} !duration-500 data-[state=open]:!zoom-in-90 data-[state=open]:!slide-in-from-bottom-8 data-[state=closed]:!zoom-out-95 data-[state=closed]:!slide-out-to-bottom-4`}
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
              onClaim={handleClaim}
              claiming={claiming}
              claimed={claimed}
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
                      <span className="flex items-center gap-1 bg-[#110A2B] border border-[#393B60] rounded-[999px] px-2 py-0.5 text-[11px] text-white font-semibold">
                        <img src="/wallet.png" alt="Wallet Icon" className="w-3.5 h-3.5" />
                        {(Number(walletBalance) / 10 ** 18).toFixed(2)} TRUST
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
                      <span className="relative z-10">Create Claim</span>
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
  onClaim: () => void;
  claiming: boolean;
  claimed: boolean;
}

function SuccessView({ xpReward, onClaim, claiming, claimed }: SuccessViewProps) {
  const xpAmount = typeof xpReward !== "undefined" ? String(xpReward) : "0";

  return (
    <div className="px-[14px] sm:px-[17px] pt-[14px] pb-[12px]">
      <div
        className="relative overflow-hidden rounded-[14px] border border-[rgba(212,187,255,0.1)] bg-[rgba(28,32,37,0.6)] backdrop-blur-[10px] shadow-[0_0_20px_0_rgba(138,63,252,0.1)] p-4 sm:p-5 flex flex-col items-center justify-center min-h-[240px] animate-in fade-in zoom-in-95 duration-500"
        style={{ animationFillMode: "both" }}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,187,255,0.22) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div
            className="w-[48px] h-[48px] rounded-[12px] bg-[rgba(0,225,162,0.1)] border border-[rgba(0,225,162,0.3)] flex items-center justify-center animate-in zoom-in-50 fade-in duration-500"
            style={{ animationDelay: "120ms", animationFillMode: "both" }}
          >
            <Check className="w-5 h-5 text-[#00e1a2]" strokeWidth={3} />
          </div>

          <h2
            className="mt-4 font-bold text-[17px] sm:text-[22px] text-white text-center leading-[1.05] tracking-[-0.6px] animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "220ms", animationFillMode: "both" }}
          >
            Claim Created
            <br />
            Successfully
          </h2>

          <p
            className="mt-2.5 text-[#94a3b8] text-[10px] sm:text-[11px] text-center leading-[14px] max-w-[224px] animate-in fade-in duration-500"
            style={{ animationDelay: "320ms", animationFillMode: "both" }}
          >
            Your onchain claim has been verified and recorded on The Intuition Knowledge Graph.
          </p>

          <div
            className="mt-4 flex flex-col items-center gap-0.5 animate-in fade-in zoom-in-95 duration-500"
            style={{ animationDelay: "420ms", animationFillMode: "both" }}
          >
            <div className="flex items-end gap-1">
              <span
                className="text-[#d4bbff] text-[28px] sm:text-[32px] font-bold leading-none"
                style={{ textShadow: "0 0 10px rgba(212,187,255,0.5)" }}
              >
                +{xpAmount}
              </span>
              <span className="text-[#94e2ff] text-[11px] sm:text-[12px] font-bold mb-1">XP</span>
            </div>
          </div>

          <button
            onClick={onClaim}
            disabled={claiming}
            data-testid="proof-success-claim-cta"
            className="mt-4 px-5 py-[9px] rounded-[100px] font-bold text-[10px] sm:text-[11px] text-[#270058] bg-gradient-to-r from-[#8a3ffc] to-[#00ccf9] flex items-center gap-1.5 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(138,63,252,0.55)] active:scale-[0.98] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ animationDelay: "540ms", animationFillMode: "both" }}
          >
            {claiming ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={3} />
                Claiming...
              </>
            ) : claimed ? (
              <>
                Close
                <ArrowRight className="w-3 h-3" strokeWidth={3} />
              </>
            ) : (
              <>
                Claim XP Rewards
                <ArrowRight className="w-3 h-3" strokeWidth={3} />
              </>
            )}
          </button>
        </div>
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
