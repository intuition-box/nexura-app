import { useEffect, useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { createProofOfAction } from "../services/web3";
import { useToast } from "../hooks/use-toast";
import { toUserFriendlyErrorMessage } from "../lib/errorMessages";
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
}

const SUBJECT = "I";
const TRIPLE_COST = "50.00 $TRUST";
const INITIAL_DEPOSIT_TOTAL = "1,000.00 $TRUST";

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
  stakeUsd = "$214.20",
  onSuccess,
  sourceLabel,
}: ProofOfActionModalProps) {
  const { toast } = useToast();
  const [staking, setStaking] = useState(false);
  const [staked, setStaked] = useState(false);

  useEffect(() => {
    if (!open) {
      setStaking(false);
      setStaked(false);
    }
  }, [open]);

  const objectName = object?.trim();
  const objectLabel = objectName ? `${objectName} on nexura` : "this action on nexura";
  const predicateLabel = resolvePredicate(sourceLabel);
  const objectIcon = resolveObjectIcon(sourceLabel);

  const handleStake = async () => {
    if (staking || staked) return;
    if (!objectName) {
      toast({
        title: "Stake failed",
        description: "Missing action context. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setStaking(true);

    try {
      const txHash = await createProofOfAction({
        subjectString: SUBJECT,
        predicateString: predicateLabel,
        objectString: objectLabel,
      });
      setStaked(true);
      await onSuccess(txHash);
      toast({
        title: "Proof of Action staked",
        description: "Your XP has been claimed.",
      });
      setTimeout(() => onOpenChange(false), 900);
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

          <div className="px-[34px] pt-[26px] pb-[26px]">
            <h2
              className="text-[#e0e2ea] font-bold text-[24px] sm:text-[30px] leading-[40px] tracking-[-1.2px] animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms", animationFillMode: "both" }}
            >
              Proof of Action
            </h2>

            <p
              className="text-[#cdc2d8] text-[14px] sm:text-[15px] font-medium leading-[22px] mt-1.5 max-w-[501px] animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "140ms", animationFillMode: "both" }}
            >
              Create a structured claim using semantic triples to prove task completion. The system validates your claim after staking. Only valid claims unlock XP rewards.
            </p>

            <div className="mt-5 flex flex-col lg:flex-row gap-5 lg:gap-[56px] lg:items-stretch">
              <div className="flex-1 min-w-0 space-y-4">
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
                <div className="bg-[#1C0E3480] border border-white/10 rounded-2xl p-5 space-y-4 h-full flex flex-col">
                  <div>
                    <h3 className="text-[#e0e2ea] font-semibold text-[16px] leading-[28px]">
                      Stake on this Claim
                    </h3>
                    <p className="text-[#cdc2d8] text-[10px] leading-[16px] mt-1">
                      Support this claim by with measurable $TRUST value.
                    </p>
                  </div>

                  <div className="h-px bg-[#393b60]" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(255,255,255,0.6)] text-[10px] font-bold tracking-[1px] uppercase">
                        Initial Deposit
                      </span>
                      <span className="text-[rgba(255,255,255,0.6)] text-[12px] font-semibold">
                        0 TRUST
                      </span>
                    </div>
                    <div className="bg-[rgba(6,2,16,0.6)] border border-[rgba(131,58,253,0.5)] rounded-xl h-[40px] px-[18px] flex items-center justify-between">
                      <span className="text-[rgba(255,255,255,0.42)] text-[12px] font-semibold">
                        {stakeTrust}
                      </span>
                      <span className="text-[rgba(255,255,255,0.42)] text-[12px] font-semibold">
                        min
                      </span>
                    </div>
                  </div>

                  <div className="bg-[rgba(6,2,16,0.6)] border border-[rgba(131,58,253,0.5)] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(255,255,255,0.42)] text-[12px] font-semibold leading-[20px]">
                        Triple Cost
                      </span>
                      <span className="text-[rgba(255,255,255,0.42)] text-[12px] font-semibold leading-[20px]">
                        {TRIPLE_COST}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(255,255,255,0.42)] text-[12px] font-semibold leading-[20px]">
                        Initial Deposit
                      </span>
                      <span className="text-[rgba(255,255,255,0.42)] text-[12px] font-semibold leading-[20px]">
                        {INITIAL_DEPOSIT_TOTAL}
                      </span>
                    </div>
                    <div className="h-px bg-[#393b60] my-1" />
                    <div className="flex items-start justify-between">
                      <span className="text-[#e0e2ea] text-[14px] font-bold leading-[24px]">
                        Total
                      </span>
                      <div className="text-right">
                        <div className="text-[#d4bbff] text-[14px] font-bold leading-[28px]">
                          {stakeTrust} $TRUST
                        </div>
                        <div className="text-[#968da1] text-[8px] leading-[15px]">
                          &asymp; {stakeUsd} USD
                        </div>
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
                    disabled={staking || staked}
                    data-testid="proof-modal-deposit"
                    className={`w-full h-[42px] rounded-[100px] font-semibold text-[14px] flex items-center justify-center gap-2 mt-auto relative overflow-hidden transition-all duration-300 ease-out ${
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
        </div>
      </DialogContent>
    </Dialog>
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
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[12px] font-semibold tracking-[1px] uppercase leading-[15px]"
          style={{ color: labelColor }}
        >
          {label}
        </span>
        <img src={infoIcon} alt="" className="w-[14px] h-[14px] opacity-80" />
      </div>
      <div
        className="flex items-center gap-[14px] bg-[rgba(10,14,19,0.7)] rounded-[14px] px-[10px] py-[6px] h-[44px]"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <TripleAvatar type={avatarType} src={avatarSrc} />
        <p className="text-white text-[14px] font-semibold leading-normal truncate flex-1 min-w-0">
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
