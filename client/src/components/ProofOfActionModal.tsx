import { useEffect, useState } from "react";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { createProofOfAction } from "../services/web3";
import { useToast } from "../hooks/use-toast";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStaking(false);
      setStaked(false);
      setError(null);
    }
  }, [open]);

  const objectName = object?.trim();
  const objectLabel = objectName ? `${objectName} on nexura` : "this action on nexura";
  const predicateLabel = resolvePredicate(sourceLabel);
  const objectIcon = resolveObjectIcon(sourceLabel);

  const handleStake = async () => {
    if (staking || staked) return;
    if (!objectName) {
      setError("Missing action context. Please try again.");
      return;
    }

    setStaking(true);
    setError(null);

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
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Unable to stake Proof of Action.";
      setError(message);
      toast({
        title: "Stake failed",
        description: message,
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
        className="p-0 border-0 bg-transparent shadow-none w-[calc(100vw-32px)] max-w-[897px] sm:w-[897px]"
      >
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #2A085E 0%, #3D0F8A 100%)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            minHeight: "487px",
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

          <div className="px-[34px] pt-[40px] pb-[40px]">
            <h2 className="text-[#e0e2ea] font-bold text-[24px] sm:text-[30px] leading-[48px] tracking-[-1.2px]">
              Proof of Action
            </h2>

            <p className="text-[#cdc2d8] text-[14px] sm:text-[16px] font-medium leading-[26px] mt-2 max-w-[501px]">
              Create a structured claim using semantic triples to prove task completion. The system validates your claim after staking. Only valid claims unlock XP rewards.
            </p>

            <div className="mt-8 flex flex-col lg:flex-row gap-6 lg:gap-[71px]">
              <div className="flex-1 min-w-0 space-y-5">
                <TripleField
                  label="SUBJECT"
                  labelColor="#8b3efe"
                  borderColor="#8b3efe"
                  infoIcon={infoSubjectImg}
                  avatarType="image"
                  avatarSrc={subjectAvatarImg}
                  value={SUBJECT}
                />
                <TripleField
                  label="PREDICATE"
                  labelColor="#b65fc8"
                  borderColor="#b65fc8"
                  infoIcon={infoPredicateImg}
                  avatarType="check"
                  avatarSrc={predicateCheckImg}
                  value={predicateLabel}
                />
                <TripleField
                  label="OBJECT"
                  labelColor="#00e1a2"
                  borderColor="#00e1a2"
                  infoIcon={infoObjectImg}
                  avatarType="icon"
                  avatarSrc={objectIcon}
                  value={objectLabel}
                />

                {error && (
                  <div className="flex items-start gap-2 rounded-[14px] border border-red-500/40 bg-red-500/10 px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-300 leading-snug break-words">
                      {error}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[309px] shrink-0">
                <div className="bg-[#1C0E3480] border border-white/10 rounded-2xl p-5 space-y-4">
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
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#00e1a2] font-semibold">
                      <span>Unlocks +{xpReward} XP</span>
                    </div>
                  )}

                  <button
                    onClick={handleStake}
                    disabled={staking || staked}
                    data-testid="proof-modal-deposit"
                    className={`w-full h-[40px] rounded-[100px] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-200 ${
                      staked
                        ? "bg-[#00e1a2] text-black"
                        : staking
                          ? "bg-white/60 text-black/60 cursor-wait"
                          : "bg-white text-black hover:bg-white/90 active:scale-[0.99]"
                    }`}
                  >
                    {staked ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={3} />
                        Claimed
                      </>
                    ) : staking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Staking…
                      </>
                    ) : (
                      "Deposit"
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
