
import { useParams } from "wouter";
import { useState, useEffect, useRef, useMemo } from "react"
import { Address, formatEther, parseEther } from "viem";
import { formatNumber } from "../lib/utils";
import { toFixed } from "./PortalClaims";
import { apiRequestV2 } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import { useWallet } from "../hooks/use-wallet";
import { buyShares, sellShares } from "../services/web3";
import { useToast } from "../hooks/use-toast";
import { Term, Position } from "../types/types";
import { getPublicClient, getWalletClient } from "../lib/viem";
import chain from "../lib/chain";
import { multiVaultPreviewDeposit, multiVaultPreviewRedeem, getMultiVaultAddressFromChainId } from "@0xintuition/sdk";
import Chart from "react-apexcharts";
import html2canvas from "html2canvas";


export default function ClaimDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("all");
  const [mainTab, setMainTab] = useState("support");
  const [isBuy, setIsBuy] = useState(true);
  const [positionType, setPositionType] = useState("support");
  const [growthType, setGrowthType] = useState("linear");
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [userPositions, setUserPositions] = useState<Position[]>([]);
  const [visiblePositions, setVisiblePositions] = useState<Position[]>([]); // paginated slice
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const [claim, setClaim] = useState<any | null>(null);
  const [buying, setBuying] = useState(false);
  const [selling, setSelling] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [term, setTerm] = useState<Term>({});
  const [counterTerm, setCounterTerm] = useState<Term>({});
  const [supportCount, setSupportCount] = useState(0);
  const [opposeCount, setOpposeCount] = useState(0);
  const [supportPercent, setSupportPercent] = useState(0);
  const [opposePercent, setOpposePercent] = useState(0);
  const [totalPostions, setTotalPositions] = useState("0");
  const [marketCap, setMarketCap] = useState("0");
  const cardRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [amountToReceive, setAmountToReceive] = useState("0");
  const [loadingAmount, setLoadingAmount] = useState(false);
  const [sortOption, setSortOption] = useState("")
  const [positionsOption, setPositionsOption] = useState("all");
  const [activePosition, setActivePosition] = useState<any | null>(null);
  const inputAmount = isBuy ? buyAmount : sellAmount;
  const receiveTimeoutRef = useRef(null);
  const [showCurveInfo, setShowCurveInfo] = useState(false);
  // const [userShares, setUserShares] = useState("")

const currentAmount = isBuy ? buyAmount : sellAmount;

  const { user } = useAuth();
  const { connectWallet } = useWallet();
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 10;

  const loadMorePositions = () => {
    if (!hasMore) return;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    const nextItems = positions.slice(start, end) as never[];

    setVisiblePositions(prev => [...prev, ...nextItems]);
    console.log(visiblePositions);

    if (end >= positions.length) {
      setHasMore(false);
    } else {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    setVisiblePositions([]);
    setPage(1);
    setHasMore(true);
  }, [positions]);

  useEffect(() => {
    loadMorePositions();
  }, []);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMorePositions();
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, page]);

  useEffect(() => {
    fetchClaim();
  }, [id]);

  useEffect(() => {
    (async () => {
      const curveId = growthType === "linear" ? 1n : 2n;
      const publicClient = getPublicClient();

      const walletClient = await getWalletClient();

      await walletClient.switchChain({ id: chain.id });

      const address = getMultiVaultAddressFromChainId(walletClient.chain?.id!);

      let sharesAmount = 0n;

      if (isBuy && buyAmount) {
        const [shares] = await multiVaultPreviewDeposit(
          { address, walletClient, publicClient },
          { args: [id as "0x", curveId, parseEther(buyAmount)] }
        );
        sharesAmount = shares;

      } else if (!isBuy && sellAmount) {
        const [shares] = await multiVaultPreviewRedeem(
          { address, walletClient, publicClient },
          { args: [id as "0x", curveId, parseEther(sellAmount)] }
        );
        sharesAmount = shares;
      }

      setAmountToReceive(formatEther(sharesAmount));
    })();
  }, [buyAmount, sellAmount]);

  useEffect(() => {
    (async () => {
      if (user) {
        const userBalance = await getBalance();
        setBalance(userBalance);
      }
    })();
  }, [user]);

  useEffect(() => {
  if (!user) return;
  fetchClaim();
}, [user]);

  async function fetchClaim() {
    const fetched = await apiRequestV2("GET", "/api/get-triple?termId=" + id);
    setClaim(fetched);

    // Support / Oppose totals
    const supportAssets = parseFloat(formatEther(BigInt(fetched.term.total_assets)));
    const opposeAssets = parseFloat(formatEther(BigInt(fetched.counter_term.total_assets)));
    const totalAssets = supportAssets + opposeAssets;

    setSupportCount(supportAssets);
    setOpposeCount(opposeAssets);
    setSupportPercent((supportAssets / totalAssets) * 100);
    setOpposePercent((opposeAssets / totalAssets) * 100);

    setTotalPositions(formatNumber(parseInt(fetched.total_position_count)));
    setMarketCap(formatNumber(parseFloat(formatEther(BigInt(fetched.total_market_cap)))));

    setTerm(fetched.term);
    setCounterTerm(fetched.counter_term);

    // All positions
const allPositions = [
  ...(fetched.term.positions ?? []).map(p => ({ ...p, direction: "support" })),
  ...(fetched.counter_term.positions ?? []).map(p => ({ ...p, direction: "oppose" })),
];
setPositions(allPositions);

// Normalize user positions to match table structure
let myPositions: Position[] = [];

if (user) {
  myPositions = [
    // Support positions from term vaults
    ...(fetched.term.vaults?.[0]?.userPosition ?? []).map(p => ({
      ...p,
      direction: "support",
      curve_id: 1, // Linear
      account: {
        id: p.account_id,  // use ID as display name
        label: p.account_id,
        image: user.image ?? null,
      },
    })),
    ...(fetched.term.vaults?.[1]?.userPosition ?? []).map(p => ({
      ...p,
      direction: "support",
      curve_id: 1,
      account: {
        id: p.account_id,
        label: p.account_id,
        image: user.image ?? null,
      },
    })),
    // Oppose positions from counter_term vaults
    ...(fetched.counter_term.vaults?.[0]?.userPosition ?? []).map(p => ({
      ...p,
      direction: "oppose",
      curve_id: 2, // Exponential
      account: {
        id: p.account_id,
        label: p.account_id,
        image: user.image ?? null,
      },
    })),
    ...(fetched.counter_term.vaults?.[1]?.userPosition ?? []).map(p => ({
      ...p,
      direction: "oppose",
      curve_id: 2,
      account: {
        id: p.account_id,
        label: p.account_id,
        image: user.image ?? null,
      },
    })),
  ];

  console.log("Normalized userPositions:", myPositions);
} else {
  console.log("No user signed in, no positions to fetch");
}

setUserPositions(myPositions);
    // Initially show first page for active tab
    const initial = activeTab === "all" ? allPositions : myPositions;
    setVisiblePositions(initial.slice(0, ITEMS_PER_PAGE));
  };

  useEffect(() => {
  if (!term?.vaults || !counterTerm?.vaults) return;

  const supportPrices = term.vaults.map((v: any, i: number) => ({
    type: "support",
    index: i,
    raw: v.current_share_price,
    formatted: formatEther(BigInt(v.current_share_price))
  }));

  const counterPrices = counterTerm.vaults.map((v: any, i: number) => ({
    type: "counter",
    index: i,
    raw: v.current_share_price,
    formatted: formatEther(BigInt(v.current_share_price))
  }));

  const allPrices = [...supportPrices, ...counterPrices];

  console.log("==== VAULT SHARE PRICES ====");
  console.table(allPrices);

}, [term, counterTerm]);

const userShares = useMemo(() => {
  if (!user) return 0;

  // Find the entry for the logged-in user
  const up = userPositions.find(
    pos => pos.account_id.toLowerCase() === user.address.toLowerCase()
  );

  return up ? Number(formatEther(BigInt(up.shares))) : 0;
}, [userPositions, user]);

const hasOppositePosition = useMemo(() => {
  if (!user || !userPositions.length) return false;

  // Opposite tab direction
  const oppositeDirection = mainTab === "support" ? "oppose" : "support";

  // Block if user has any shares in the opposite tab, ignore curve
  return userPositions.some(
    (pos) =>
      pos.direction === oppositeDirection &&
      Number(formatEther(BigInt(pos.shares ?? 0))) > 0
  );
}, [userPositions, mainTab, user]);

function getPrice() {
  let sharePrice = "0";

  const getVaultPrice = (vaults: typeof term.vaults | typeof counterTerm.vaults, index: number) => {
    const price = vaults[index]?.current_share_price ?? "0";
    console.log(`Vault index ${index}:`, price);
    return price;
  };

  if (activeTab === "support") {
    sharePrice = growthType === "linear"
      ? getVaultPrice(term.vaults, 0)
      : getVaultPrice(term.vaults, 1);
    console.log(`ActiveTab: support, GrowthType: ${growthType}`);
  } else {
    sharePrice = growthType === "linear"
      ? getVaultPrice(counterTerm.vaults, 0)
      : getVaultPrice(counterTerm.vaults, 1);
    console.log(`ActiveTab: oppose, GrowthType: ${growthType}`);
  }

  // Use formatEther to convert BigInt string → human-readable decimal
  const formattedPrice = parseFloat(formatEther(BigInt(sharePrice))).toFixed(2);
  console.log("Calculated sharePrice (formatted):", formattedPrice);

  return formattedPrice;
}

 const getUserShares = async () => {
  if (!user) return;

  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();
  await walletClient.switchChain({ id: chain.id });

  const address = getMultiVaultAddressFromChainId(walletClient.chain?.id!);

  const linearCurve = 1n;
  const exponentialCurve = 2n;

  let totalShares = 0n;

  // sum across all vaults for both term and counterTerm
  for (const curveId of [linearCurve, exponentialCurve]) {
    const [userSupportShares] = await multiVaultPreviewRedeem(
      { walletClient, publicClient, address },
      { args: [term.id as Address, curveId, 0n] }
    );
    const [userOpposeShares] = await multiVaultPreviewRedeem(
      { walletClient, publicClient, address },
      { args: [counterTerm.id as Address, curveId, 0n] }
    );
    totalShares += userSupportShares + userOpposeShares;
  }

  setUserShares(formatEther(totalShares));
};

const refreshUserData = async () => {
  if (!user) return;

  const updatedBalance = await getBalance();
  setBalance(updatedBalance);

  await fetchClaim();


};

const handleClaimAction = async () => {
  if (!user) return await handleConnectWallet();

  if (isBuy && hasOppositePosition) {
    toast({
      title: "Position conflict",
      description: "You must close your opposite position first.",
      variant: "destructive",
    });
    return;
  }

  const amountNum = parseFloat(isBuy ? buyAmount : sellAmount);
  if (!amountNum || amountNum <= 0) {
    toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
    return;
  }

  const curveId = growthType === "linear" ? 1n : 2n;
  const address = mainTab === "support" ? id : claim.counter_term_id;

  try {
    if (isBuy) setBuying(true);
    else setSelling(true);

    // -------------------- Preview Shares --------------------
    const publicClient = getPublicClient();
    const walletClient = await getWalletClient();
    await walletClient.switchChain({ id: chain.id });
    const vaultAddress = getMultiVaultAddressFromChainId(walletClient.chain?.id!);

    let previewShares = 0n;
    let updatedSharePrice = 0n;

    if (isBuy && buyAmount) {
      const [shares, price] = await multiVaultPreviewDeposit(
        { address: vaultAddress, walletClient, publicClient },
        { args: [id as "0x", curveId, parseEther(buyAmount)] }
      );
      previewShares = shares;
      updatedSharePrice = price;
    } else if (!isBuy && sellAmount) {
      const [shares, price] = await multiVaultPreviewRedeem(
        { address: vaultAddress, walletClient, publicClient },
        { args: [id as "0x", curveId, parseEther(sellAmount)] }
      );
      previewShares = shares;
      updatedSharePrice = price;
    }

    const sharesFloat = parseFloat(formatEther(previewShares));

    // -------------------- Optimistically update user positions --------------------
    setUserPositions(prev => {
      const dir = mainTab; // "support" or "oppose"
      const existing = prev.find(p => p.direction === dir && p.account.id === user.address);

      if (existing) {
        existing.shares = (isBuy
          ? Number(existing.shares) + sharesFloat
          : Math.max(Number(existing.shares) - sharesFloat, 0)).toString();
        return [...prev];
      }

      if (isBuy) {
        return [
          ...prev,
          {
            direction: dir,
            shares: sharesFloat,
            account: {
              id: user.address,
              label: user.address,
              image: user.image ?? null,
            },
            curve_id: growthType === "linear" ? 1 : 2,
          },
        ];
      }

      return prev;
    });

    // -------------------- Update vault price --------------------
    const vaultIndex = growthType === "linear" ? 0 : 1;
    if (mainTab === "support") {
      term.vaults[vaultIndex].current_share_price = updatedSharePrice.toString();
    } else {
      counterTerm.vaults[vaultIndex].current_share_price = updatedSharePrice.toString();
    }

    // -------------------- Execute transaction --------------------
    if (isBuy) await buyShares(buyAmount, address as Address, curveId);
    else await sellShares(sellAmount, address as Address, curveId);

    // -------------------- Refresh user data --------------------
    await refreshUserData();

    toast({
      title: "Success",
      description: (
        <div className="flex items-center gap-2 text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>{`Shares ${isBuy ? "bought" : "sold"} successfully!`}</span>
        </div>
      ),
    });
  } catch (err: any) {
    console.error(err);
    toast({
      title: "Error",
      description: err.message || `Failed ${isBuy ? "buying" : "selling"} shares`,
      variant: "destructive",
    });
  } finally {
    setBuying(false);
    setSelling(false);
  }
};

  const handleConnectWallet = async () => {
    await connectWallet();
  }

  async function getBalance() {
    const publicClient = getPublicClient();

    const balance = await publicClient?.getBalance({ address: user?.address as Address });

    return formatEther(balance ?? 0n);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////
  const sourcePositions = activeTab === "my" ? userPositions : positions;

  const processedPositions = useMemo(() => {
  // Decide source based on active tab
  let data = activeTab === "my" ? [...userPositions] : [...positions];

  // FILTER
  if (positionsOption !== "all") {
    data = data.filter((pos) => {
      if (positionsOption === "linear") return Number(pos.curve_id) === 1;
      if (positionsOption === "exponential") return Number(pos.curve_id) === 2;
      if (positionsOption === "support") return pos.direction?.toLowerCase() === "support";
      if (positionsOption === "oppose") return pos.direction?.toLowerCase() === "oppose";
      return true;
    });
  }

  // SORT
  switch (sortOption) {
    case "highest_shares":
      data.sort((a, b) =>
        Number(formatEther(BigInt(b.shares ?? 0))) -
        Number(formatEther(BigInt(a.shares ?? 0)))
      );
      break;
    case "lowest_shares":
      data.sort((a, b) =>
        Number(formatEther(BigInt(a.shares ?? 0))) -
        Number(formatEther(BigInt(b.shares ?? 0)))
      );
      break;
    case "newest":
      data.sort((a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
      break;
    case "oldest":
      data.sort((a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
      break;
    case "a_to_z":
      data.sort((a, b) =>
        (a.account?.label ?? "").localeCompare(b.account?.label ?? "")
      );
      break;
    case "z_to_a":
      data.sort((a, b) =>
        (b.account?.label ?? "").localeCompare(a.account?.label ?? "")
      );
      break;
  }

  return data;
}, [activeTab, positions, userPositions, positionsOption, sortOption]);


const numericBalance = Number(balance);
const hasBalance = numericBalance > 0;
const tradeLocked = !hasBalance || hasOppositePosition;

const currentUrl = window.location.href;

const [modalLoading, setModalLoading] = useState(true);
  useEffect(() => {
    setModalLoading(true);
    const timer = setTimeout(() => setModalLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [term]);

const handleGenerateImage = async () => {
    if (!cardRef.current) return;
    setGeneratingImage(true);

    try {
      const canvas = await html2canvas(cardRef.current);
      const imgData = canvas.toDataURL("image/png");
      setImageData(imgData);
    } catch (err) {
      console.error(err);
      alert("Failed to generate image.");
    } finally {
      setGeneratingImage(false);
    }
  };

const handleDownload = async () => {
  if (!cardRef.current) {
    alert("Card not ready for download.");
    return;
  }

  try {
    // Capture the modal card
    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      scale: 2,
    });

    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "claim_snapshot.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error(err);
    alert("Failed to download image.");
  }
};

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => alert("Failed to copy link."));
  };

  const handleShareX = () => {
    const text = `Check out this claim: ${currentUrl}`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, "_blank");
  };

  function generateChartData(claim: any, growthType: string) {
  const days = 7;
  const dates: string[] = [];
  const today = new Date();

  // Generate last 7 dates in DD/MM format
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    dates.push(`${day}/${month}`);
  }

  const todayPrice = Number(getPrice()); // final/current share price
  const values: number[] = [];
  let lastValue = todayPrice;

  // Generate previous values
  for (let i = days - 1; i >= 0; i--) {
    let fluctuation: number;

    if (growthType === "linear") {
      fluctuation = (Math.random() - 0.5) * 0.02; 
    } else {
      fluctuation = (Math.random() - 0.5) * 0.1; 
    }

    let value = lastValue - Math.abs(fluctuation); 

    // Clamp values
    if (todayPrice <= 1) {
      value = Math.max(-1, Math.min(1, value));
    } else {
      value = Math.max(todayPrice * 0.9, Math.min(todayPrice * 1.1, value));
    }

    values.unshift(parseFloat(value.toFixed(2)));
    lastValue = value;
  }

  return dates.map((date, i) => ({ date, value: values[i] }));
}

  if (!claim) return <div className="p-3 text-white">
    <div className="flex items-center justify-center w-full h-full">
  <svg
    className="w-8 h-8 animate-spin text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
</div>
      </div>;

  return (
    <div className="p-3 text-white font-geist font-light tracking-wide space-y-6">

{/* Top Statement */}
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-lg">
  <img src={term.triple.subject.image} alt="Claim Icon" className="w-12 h-12 sm:w-16 sm:h-16" />
  <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
    <span className="bg-[#0b0618] px-2 py-1 rounded">{term.triple.subject.label}</span>
    <span>{term.triple.predicate.label}</span>
    <span className="bg-[#0b0618] px-2 py-1 rounded">{term.triple.object.label}</span>
  </div>
</div>
      <div>


          {/* Total Market Cap */}
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-4 w-full">
  <div className="flex items-center gap-2 flex-wrap">
    <span className="opacity-50 text-xs">Total Market Cap</span>
    <span className="text-xs sm:text-sm">{marketCap} TRUST</span>
    <img src="/intuition-icon.png" className="w-4 h-4 sm:w-5 sm:h-5" />
  </div>

          {/* Divider */}
          <span className="hidden sm:block border-l border-gray-500 h-6"></span>

          {/* Total Position */}
  <div className="flex items-center gap-2 flex-wrap">
    <span className="opacity-50 text-xs">Total Position:</span>
    <span className="text-xs sm:text-sm">{totalPostions}</span>
  </div>

          {/* Divider */}
          <span className="hidden sm:block border-l border-gray-500 h-6"></span>

          {/* Creator */}
  <div className="flex items-center gap-2 flex-wrap">
    <span className="opacity-50 text-xs">Creator:</span>
    <span className="text-xs sm:text-sm">{term.triple.creator.label}</span>
  </div>

{/* Share Button */}
<div className="flex flex-row sm:flex-row items-center w-full">
  <button
    onClick={() => {
      setIsShareModalOpen(true);
      setGeneratingImage(true);
      setTimeout(() => setGeneratingImage(false), 2500);
      handleGenerateImage();
    }}
    className="mt-2 sm:mt-0 px-3 py-1 bg-[#110A2B] rounded-md text-xs sm:text-sm hover:bg-[#1A0F3D] transition-colors
               sm:ml-auto"
  >
    Share
  </button>
</div>

{isShareModalOpen && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 sm:p-0">
    <div className="bg-[#070315] rounded-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg relative">

      {/* Close Button */}
      <button
        onClick={() => setIsShareModalOpen(false)}
        className="absolute top-3 right-3 text-white text-2xl sm:text-xl"
      >
        ×
      </button>

      {/* Card Container */}
      <div ref={cardRef} className="relative flex flex-col gap-4">

        {/* Overlay for Generating Image */}
        {generatingImage && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10 gap-2">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            <span className="text-sm sm:text-base">Generating image...</span>
          </div>
        )}

        {/* Card Content */}
        {!generatingImage && (
          <>
            {/* Total Market Cap */}
            <div className="flex flex-col items-end text-gray-300 text-sm sm:text-base mb-2">
              <span>Total Market Cap</span>
              <span className="text-lg sm:text-xl text-white">
                {toFixed(formatEther(BigInt(claim.total_market_cap)))} TRUST
              </span>
            </div>

            {/* Support / Oppose Cards */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
              <div className="flex-1 bg-[#006CD233] border border-[#393B60] rounded-xl p-3 flex flex-col gap-2">
                <span className="text-sm sm:text-lg text-[#006CD2]">SUPPORT</span>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span>{toFixed(formatEther(BigInt(claim.term.total_assets)))}</span>
                  <img src="/intuition-icon.png" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-blue-400">{formatNumber(claim.term.positions_aggregate.aggregate.count)}</span>
                </div>
              </div>

              <div className="flex-1 bg-[#F19C0333] border border-[#393B60] rounded-xl p-3 flex flex-col gap-2">
                <span className="text-sm sm:text-lg text-[#F19C03]">OPPOSE</span>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span>{toFixed(formatEther(BigInt(claim.counter_term.total_assets)))}</span>
                  <img src="/intuition-icon.png" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[#F19C03]">{formatNumber(claim.counter_term.positions_aggregate.aggregate.count)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-5 bg-gray-700 rounded-lg overflow-hidden relative mt-2">
              <div className="flex h-full text-white text-xs sm:text-sm">
                <div
                  className="bg-blue-600 flex items-center justify-center transition-all duration-500"
                  style={{ width: `${supportPercent}%` }}
                >
                  {supportPercent.toFixed(0)}%
                </div>
                <div
                  className="bg-[#F19C03] flex items-center justify-center transition-all duration-500"
                  style={{ width: `${opposePercent}%` }}
                >
                  {opposePercent.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
              {/* Post on X */}
              <button
                onClick={handleShareX}
                className="flex items-center gap-2 px-3 py-1 bg-[#1DA1F2] text-white text-sm rounded-md hover:bg-[#0d95e8] transition-colors w-full sm:w-auto justify-center"
              >
                <span>Post on X</span>
                <div className="bg-white/20 p-1 flex items-center justify-center">
                  <img src="/x-icon.png" alt="X Icon" className="w-6 h-6" />
                </div>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-1 bg-[#393B60] text-white text-sm rounded-md hover:bg-[#4a4c7a] transition-colors w-full sm:w-auto justify-center"
              >
                <span>Copy Link</span>
                <div className="bg-white/10 p-1 flex items-center justify-center">
                  <img src="/copy-link.png" alt="Copy Link" className="w-6 h-6" />
                </div>
              </button>

              {/* Save as Image */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1 bg-[#110A2B] text-white text-sm rounded-md hover:bg-[#1a0f3d] transition-colors w-full sm:w-auto justify-center"
              >
                <span>Save as Image</span>
                <div className="bg-white/10 p-1 flex items-center justify-center">
                  <img src="/download-icon.png" alt="Download" className="w-6 h-6" />
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}
        </div>
      </div>


      <div className="flex flex-col lg:flex-row gap-3 mt-3">
{/* Graph Container */}
<div className="w-full lg:max-w-[1200px] mx-auto bg-gradient-to-br from-[#1A0A2B] to-[#0B0515] rounded-xl p-3 sm:p-4 shadow-lg items-center">

  {/* Chart Header */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="text-xs sm:text-sm text-gray-400">Share Price</span>
      <div className="text-lg sm:text-2xl text-white">{getPrice()} TRUST</div>
    </div>

    {/* Toggle Linear / Exponential */}
    <div className="flex flex-wrap gap-1 sm:gap-2 rounded-full bg-[#1F123A] p-1 mt-2 sm:mt-0">
      {["linear", "exponential"].map((type) => (
        <button
          key={type}
          onClick={() => setGrowthType(type)}
          className={`px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm transition-all duration-300 ${
            growthType === type
              ? "bg-[#392D5F] text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
    </div>

    {/* ApexCharts Area Graph */}
    <Chart
      type="area"
      height={280} // slightly smaller for mobile
      series={[
        {
          name: "Share Price",
          data: generateChartData(claim, growthType).map(d => ({ x: d.date, y: d.value })),
        },
      ]}
      options={{
        chart: {
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: { enabled: true, easing: "easeinout", speed: 800 },
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 3, colors: ["#AD77FF"] },
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            gradientToColors: ["#8B3EFE"],
            opacityFrom: 0.6,
            opacityTo: 0.3,
            stops: [0, 50, 100],
          },
        },
        xaxis: {
          type: "category",
          labels: { style: { colors: "#BDAFFF", fontSize: '10px' } },
          axisBorder: { show: false },
          axisTicks: { show: false },
          crosshairs: { show: true, width: 1, color: "#8B3EFE" },
        },
        yaxis: {
          show: true,
          min: Math.min(...generateChartData(claim, growthType).map(d => d.value)) * 0.95,
          max: Math.max(...generateChartData(claim, growthType).map(d => d.value)) * 1.05,
          labels: { style: { colors: "#BDAFFF", fontSize: '10px' }, formatter: val => val.toFixed(2) },
        },
        tooltip: {
          theme: "dark",
          shared: true,
          intersect: false,
          x: { show: true },
          y: { formatter: val => `${val} TRUST` },
        },
        grid: { show: false },
      }}
    />
  </div>


{/* Control Card (20%) */}
<div className="w-full lg:w-[25%] bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col gap-4">

  {/* Support / Oppose Tabs */}
  <div className="flex flex-col sm:flex-row gap-2">
    <button
      className={`flex-1 rounded-md py-2 text-sm transition-colors duration-200 ${
        mainTab === "support"
          ? "bg-[#0A2D4D] border border-[#006CD2] text-white"
          : "bg-gray-800 border border-gray-700 text-gray-400"
      }`}
      onClick={() => setMainTab("support")}
    >
      Support
    </button>

    <button
      className={`flex-1 rounded-md py-2 text-sm transition-colors duration-200 ${
        mainTab === "oppose"
          ? "bg-[#FFA31A] border border-[#F19C03] text-white"
          : "bg-gray-800 border border-gray-700 text-gray-400"
      }`}
      onClick={() => setMainTab("oppose")}
    >
      Oppose
    </button>
  </div>


          {/* Buy / Sell Toggle */}
  <div className="flex w-full h-max overflow-hidden select-none cursor-pointer bg-[#060210] border border-[#006CD2] rounded-full text-sm">
    <div
      onClick={() => setIsBuy(true)}
      className={`flex-1 flex items-center justify-center py-1 transition-colors duration-300 ${
        isBuy ? "bg-[#8B3EFE] text-white rounded-l-full" : "bg-[#060210] text-white rounded-l-full"
      }`}
    >
      Buy
    </div>
    <div
      onClick={() => setIsBuy(false)}
      className={`flex-1 flex items-center justify-center py-1 transition-colors duration-300 ${
        !isBuy ? "bg-[#8B3EFE] text-white rounded-r-full" : "bg-[#060210] text-white rounded-r-full"
      }`}
    >
      Sell
    </div>
  </div>

 {/* Curve Section */}
<div className="flex items-center justify-between w-full gap-2">

  {/* Left: Curve Info */}
  <div className="flex flex-col min-w-0">
    <h3 className="text-white text-sm truncate">
      {growthType === "exponential" ? "Exponential Curve" : "Linear Curve"}
    </h3>
    <p className="text-gray-400 text-[0.65rem] truncate">
      {growthType === "exponential"
        ? "High Risk, High Reward"
        : "Low Risk, Low Reward"}
    </p>
  </div>

  {/* Right: Controls */}
  <div className="flex items-center gap-2 flex-shrink-0">

    {/* Toggle Button */}
    <button
      onClick={() =>
        setGrowthType(growthType === "linear" ? "exponential" : "linear")
      }
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
        growthType === "exponential" ? "bg-purple-400" : "bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
          growthType === "exponential" ? "left-6" : "left-0.5"
        }`}
      />
    </button>

    {/* Info Button */}
    <button
      onClick={() => setShowCurveInfo(true)}
      className="w-8 h-8 flex items-center justify-center rounded-full border border-[#393B60] text-gray-300 text-sm hover:bg-[#1a133d] hover:text-white transition-colors"
    >
      i
    </button>

        {/* Slide-in Modal (Fixed Right) */}
        {showCurveInfo && (
          <div className="fixed top-0 right-0 h-full w-96 bg-[#110A2B] border-l-2 border-[#393B60] p-4 z-50 animate-slideIn overflow-y-auto">

            {/* Close Button */}
            <button
              onClick={() => setShowCurveInfo(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            {/* Main Heading */}
            <h2 className="text-white text-lg text-center mb-2">
              How Bonding Curves Work
            </h2>
            <p className="text-gray-300 text-sm text-left mb-6">
              Intuition uses bonding curves to automatically set identity and claim prices based on supply and demand, rewarding early curation of valuable information.
            </p>

            {/* Linear Curve Section */}
            <img
              src="/linear-curve.svg"
              alt="Linear Curve"
              className="w-full mb-4 rounded"
            />
            <div className="text-left mb-6">
              <h4 className="text-white mb-1">Linear Curve (Safe)</h4>
              <p className="text-gray-300 text-sm mb-2">
                The Linear curve keeps pricing stable with gradual increases—your stake value increases or decreases proportionally as more people stake or redeem, making it predictable and lower-risk.
              </p>
              <p className="text-gray-400 text-sm">
                In other words, minus the fees, you will get back your original deposit value, plus any portion of the fees collected.
              </p>
            </div>

            {/* Exponential Curve Section */}
            <img
              src="/exponential.svg"
              alt="Exponential Curve"
              className="w-full mb-4 rounded"
            />
            <div className="text-left mb-6">
              <h4 className="text-white mb-1">Exponential Curve (Riskier)</h4>
              <p className="text-gray-300 text-sm mb-2">
                The Exponential curve (OffsetProgressive) rewards early stakers significantly more, as each new deposit increases the share price at an increasing rate, creating higher potential returns for curators who stake earliest, but greater potential losses as stakers redeem.
              </p>
              <p className="text-gray-300 text-sm">
                Choose based on your risk tolerance and timing. It's riskier but can yield higher returns; however, if you deposit later, you will pay more for the same amount of shares.
              </p>
            </div>
          </div>
        )}
</div>
</div>

  {/* Amount Section */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
    <span className="text-gray-400 text-xs">Amount:</span>
    <span className="text-gray-400 flex items-center gap-1 justify-end text-xs">
      <img src="/wallet.png" alt="Wallet Icon" className="w-4 h-4" />
      {isBuy
        ? `${Math.floor(Number(balance) * 100) / 100} TRUST`
        : `${Math.floor(Number(userShares) * 100) / 100} shares`}
    </span>
  </div>

  {/* Input */}
  <div className="flex w-full items-center px-2 py-1 bg-gray-800 border border-[#833AFD] rounded-md gap-2">
    <input
      type="text"
      placeholder="0.1"
      disabled={tradeLocked}
      value={currentAmount}
      onChange={e => {
        const val = e.target.value;
        if (/^\d*\.?\d*$/.test(val)) {
          isBuy ? setBuyAmount(val) : setSellAmount(val);
          setLoadingAmount(true);
          if (receiveTimeoutRef.current) clearTimeout(receiveTimeoutRef.current);
          receiveTimeoutRef.current = setTimeout(() => setLoadingAmount(false), 2000);
        }
      }}
      className={`flex-1 bg-gray-800 text-gray-300 placeholder-gray-500 text-sm p-2 outline-none ${
        tradeLocked ? "opacity-50 cursor-not-allowed" : ""
      }`}
    />

      {/* Min / Max Button */}
    <button
      disabled={tradeLocked}
      className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
        tradeLocked
          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
          : "bg-[#0A2D4D] hover:bg-[#123a63] text-white"
      }`}
      onClick={() => {
        if (tradeLocked) return;
        if (isBuy) setBuyAmount("0.01");
        else setSellAmount(userShares.toString());
      }}
    >
      {isBuy ? "min" : "max"}
    </button>
  </div>

  {/* Warnings */}
  {isBuy && currentAmount && Number(currentAmount) < 0.01 && (
    <div className="mt-1 flex items-center gap-1 text-red-400 text-xs">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
      </svg>
      Minimum deposit is 0.010000 TRUST
    </div>
  )}

{!hasBalance && <div className="mt-2 text-xs text-red-400">You shall NOT pass! Get some TRUST.</div>}

  {hasOppositePosition && (
    <div className="mt-1 flex items-center gap-1 text-red-400 text-xs">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
      </svg>
      {`You already have a ${mainTab === "support" ? "oppose" : "support"} position on this curve`}
    </div>
  )}

  {/* You Receive */}
  <div className="flex w-full justify-between items-center px-3 py-1.5 bg-gray-800 border border-[#833AFD] rounded-md text-white text-xs mt-2">
    <span>You receive</span>
    <div className="flex items-center gap-1">
      {loadingAmount ? (
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-gray-400 text-xs">Loading...</span>
        </div>
      ) : (
        <span>
          {amountToReceive && Number(currentAmount) > 0
            ? `${Math.floor(Number(amountToReceive) * 100) / 100} ${isBuy ? "shares" : "TRUST"}`
            : "--"}
        </span>
      )}
    </div>
  </div>

{/* Connect / Buy / Sell Button */}
  <div className="mt-3 flex flex-col gap-2 w-full">
    {currentAmount && Number(currentAmount) > (isBuy ? Number(balance) : userShares) && (
      <span className="text-red-400 text-xs">
        You cannot {isBuy ? "buy more than your balance" : "sell more than your shares"}!
      </span>
    )}

    <button
      onClick={async () => {
        if (!user) { await handleConnectWallet(); return; }
        if (!currentAmount || Number(currentAmount) <= 0 || Number(currentAmount) > (isBuy ? Number(balance) : userShares)) return;
        await handleClaimAction();
        isBuy ? setBuyAmount("") : setSellAmount("");
      }}
      disabled={!user || !currentAmount || Number(currentAmount) <= 0 || Number(currentAmount) > (isBuy ? Number(balance) : userShares)}
      className={`flex items-center justify-center gap-2 py-2 w-full text-sm rounded-3xl transition-all duration-200 ${
        !user || !currentAmount || Number(currentAmount) <= 0 || Number(currentAmount) > (isBuy ? Number(balance) : userShares)
          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-[#8B3EFE] to-[#B57EFF] text-white hover:from-[#B57EFF] hover:to-[#8B3EFE] hover:scale-105"
      }`}
    >
      {!user && <img src="/key.png" alt="Key Icon" className="w-4 h-4" />}
      {!user ? "Connect Wallet" : !currentAmount || Number(currentAmount) <= 0 ? "Enter Amount" : isBuy ? buying ? "Buying shares" : "Buy Shares" : selling ? "Selling shares" : "Sell Shares"}
    </button>
  </div>
</div>
</div>

{/* Your Position Card */}
<div className="bg-[#110A2B] rounded-xl p-4 flex flex-col gap-3 w-full">
  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-white text-sm sm:text-base w-full">
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      <span>Your Position</span>
      <div className="w-6 h-[3px] bg-[#AD77FF] rounded-full"></div>
    </div>

    {/* Positions Info */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-300 flex-wrap">
      {userPositions.length > 0 ? (
        (() => {
          const supportPosition = userPositions.find(p => p.direction === "support");
          const opposePosition = userPositions.find(p => p.direction === "oppose");

          if (supportPosition) {
            const totalSupport = toFixed(
             (userPositions
                .filter(p => p.direction === "support")
                .reduce((sum, p) => parseFloat(formatEther(BigInt(p.shares))), 0)).toString()
            );
            return <span className="whitespace-nowrap">Support: <span className="text-white">{totalSupport} TRUST</span></span>;
          } else if (opposePosition) {
            const totalOppose = toFixed(
             (userPositions
                .filter(p => p.direction === "oppose")
                .reduce((sum, p) => parseFloat(formatEther(BigInt(p.shares))), 0)).toString()
            );
            return <span className="whitespace-nowrap">Oppose: <span className="text-white">{totalOppose} TRUST</span></span>;
          } else {
            return <span className="text-gray-400 text-xs sm:text-sm">No positions found</span>;
          }
        })()
      ) : (
        <span className="text-gray-400 text-xs sm:text-sm">No positions found</span>
      )}
    </div>
  </div>

  {/* Divider */}
  <div className="h-px w-full bg-white opacity-80"></div>
</div>

{/* Positions on this Claim Section */}
<div className="bg-[#110A2B] rounded-xl p-4 sm:p-5 text-white flex flex-col gap-4 w-full">
  {/* Tabs */}
  <div className="flex flex-wrap gap-2 mb-2 justify-start sm:justify-start">
    <button
      className={`text-sm sm:text-base text-center rounded-md py-2 px-3 sm:px-4 transition-colors duration-200 ${
        activeTab === "all"
          ? "bg-[#0A2D4D] border border-[#006CD2] text-white"
          : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
      }`}
      onClick={() => setActiveTab("all")}
    >
      All Positions
    </button>

    <button
      className={`text-sm sm:text-base text-center rounded-md py-2 px-3 sm:px-4 transition-colors duration-200 ${
        activeTab === "my"
          ? "bg-[#0A2D4D] border border-[#006CD2] text-white"
          : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
      }`}
      onClick={() => setActiveTab("my")}
    >
      My Position
    </button>
  </div>
</div>

{/* Header + Controls */}
<div className="flex flex-col gap-3">

  {/* Dynamic Heading */}
  <h3 className="text-sm sm:text-base text-white font-semibold">
    {activeTab === "all"
      ? "All Positions on this Claim"
      : "My Position on this Claim"}
  </h3>

  {/* Controls */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">

    {/* Search */}
    <input
      type="text"
      placeholder="Search positions"
      className="w-full sm:w-[35%] bg-[#06021A] border border-[#393B60] text-white p-2 rounded-2xl outline-none text-sm"
    />

    {/* Right Side Controls */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">

      {/* Positions */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-white text-sm whitespace-nowrap">Positions:</span>

        <div className="relative w-full sm:w-36">
          <select
            value={positionsOption}
            onChange={(e) => setPositionsOption(e.target.value)}
            className="appearance-none w-full bg-[#06021A] border border-[#393B60] rounded-2xl px-4 py-2 pr-10 text-white text-sm focus:outline-none"
          >
            <option value="all">All</option>
            <option value="linear">Linear</option>
            <option value="exponential">Exponential</option>
            <option value="support">Support</option>
            <option value="oppose">Oppose</option>
          </select>

          <img
            src="/up-down.png"
            alt="Dropdown"
            className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-white text-sm whitespace-nowrap">Sort:</span>

        <div className="relative w-full sm:w-40">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="appearance-none w-full bg-[#06021A] border border-[#393B60] rounded-2xl px-4 py-2 pr-10 text-white text-sm focus:outline-none"
          >
            <option value="highest_shares">Highest Shares</option>
            <option value="lowest_shares">Lowest Shares</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="a_to_z">A - Z</option>
            <option value="z_to_a">Z - A</option>
          </select>

          <img
            src="/up-down.png"
            alt="Dropdown"
            className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      </div>
      </div>
    </div>

       {/* TABLE */}
<div className="overflow-x-auto w-full">
  <div className="min-w-[320px] sm:min-w-[700px]">
    {processedPositions.length === 0 ? (
      <div className="text-gray-400 text-center py-4 text-sm">No positions found</div>
    ) : (
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden sm:flex bg-[#060210] p-3 rounded-md text-gray-400 text-xs sm:text-sm">
          <div className="w-[5%] text-center">#</div>
          <div className="w-[35%]">Account</div>
          <div className="w-[15%] text-center">Curve</div>
          <div className="w-[15%] text-center">Direction</div>
          <div className="w-[20%] text-right">Shares</div>
        </div>

{/* Table Rows */}
{processedPositions.map((pos, idx) => (
  <div
    key={idx}
    className="bg-[#110A2B] p-3 sm:p-4 rounded-md flex flex-col sm:flex-row sm:items-center text-white text-sm sm:text-base gap-2 sm:gap-0"
  >
    {/* Index */}
    <div className="flex sm:w-[5%] w-full text-gray-400 justify-between sm:justify-center items-center">
      <span className="sm:hidden font-semibold">#:</span>
      <span>{idx + 1}</span>
    </div>

    {/* Account */}
    <div className="flex sm:w-[35%] w-full items-center gap-2 truncate">
      {pos.account?.image && (
        <img
          src={pos.account.image}
          alt={pos.account.label ?? "User"}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
        />
      )}
      <span className="truncate">{pos.account?.label ?? pos.account?.id ?? "Anonymous"}</span>
    </div>

    {/* Curve */}
    <div className="flex sm:w-[15%] w-full text-gray-400 justify-between sm:justify-center items-center">
      <span className="sm:hidden font-semibold">Curve:</span>
      <span>
        {Number(pos.curve_id) === 1
          ? "Linear"
          : Number(pos.curve_id) === 2
          ? "Exponential"
          : "—"}
      </span>
    </div>

    {/* Direction */}
    <div className="flex sm:w-[15%] w-full justify-between sm:justify-center items-center">
      <span className="sm:hidden font-semibold">Direction:</span>
      <span>
        {pos.direction?.toLowerCase() === "support"
          ? "Support"
          : pos.direction?.toLowerCase() === "oppose"
          ? "Oppose"
          : "—"}
      </span>
    </div>

    {/* Shares */}
    <div className="flex sm:w-[20%] w-full justify-between sm:justify-end text-right items-center">
      <span className="sm:hidden font-semibold">Shares:</span>
      <span>{pos.shares ? `${toFixed(formatEther(BigInt(pos.shares)))}` : "—"}</span>
    </div>
  </div>
))}
      </div>
    )}

            {/* Observer div for infinite scroll */}
            <div ref={observerRef} className="h-10"></div>

            {/* Spinner */}
            {loading && (
              <div className="flex justify-center my-4">
                <div className="loader"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
