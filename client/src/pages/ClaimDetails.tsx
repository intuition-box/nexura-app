
import { useParams } from "wouter";
import { useState, useEffect, useRef, useMemo } from "react"
import { Address, formatEther, parseEther } from "viem";
import { formatNumber } from "../lib/utils";
import { toFixed } from "./PortalClaims";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Line,
} from "recharts";
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

function generateChartData(claim: any, growthType: string) {
  const dates = ["20/01", "25/01", "30/01", "05/02", "10/02", "15/02", "20/02"];
  let values: number[] = [];

  if (growthType === "linear") {
    const basePrice = 1.06;
    values = dates.map(() => +(basePrice + (Math.random() - 0.5) * 0.01).toFixed(4));
  } else if (growthType === "exponential") {
    const basePrice = 80; // starting lower so we can rally to 90.69
    const maxPrice = 90.69;

    values = dates.map((_, i) => {
      // simple rally curve: exponential-ish but capped
      let val = basePrice * Math.pow(1.05, i); // exponential growth
      if (val > maxPrice) val = maxPrice;       // cap at max
      // add small random fluctuation
      val += (Math.random() - 0.5) * 0.5;
      return +val.toFixed(2);
    });
  }

  return dates.map((date, i) => ({ date, value: values[i] }));
}


export default function ClaimDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("support");
  const [isBuy, setIsBuy] = useState(true);
  const [positionType, setPositionType] = useState("support");
  const [growthType, setGrowthType] = useState("linear");
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]); // all positions
  const [userPositions, setUserPositions] = useState<Position[]>([]); // my positions
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
  const [balance, setBalance] = useState("0");
  const [amountToReceive, setAmountToReceive] = useState("0");
  const [isToggled, setIsToggled] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState("")
  const [loadingAmount, setLoadingAmount] = useState(false);
  const [sortOption, setSortOption] = useState("")
  const [positionsOption, setPositionsOption] = useState("all");
  const [activePosition, setActivePosition] = useState<any | null>(null);
  // const [userShares, setUserShares] = useState("0");
  // Somewhere in your component

// Assuming you have:
// - `userPositions` = your fetched user vault positions
// - `activePosition` = the currently selected position object (from allPositions)



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

    // My positions (from vaults)
    let myPositions: Position[] = [];
if (user) {
  myPositions = [
    ...(fetched.term.vaults?.[0]?.userPosition ?? []),
    ...(fetched.term.vaults?.[1]?.userPosition ?? []),
    ...(fetched.counter_term.vaults?.[0]?.userPosition ?? []),
    ...(fetched.counter_term.vaults?.[1]?.userPosition ?? []),
  ];
} else {
  console.log("No user signed in, no positions to fetch");
}
setUserPositions(myPositions);

    // Initially show first page for active tab
    const initial = activeTab === "all" ? allPositions : myPositions;
    setVisiblePositions(initial.slice(0, ITEMS_PER_PAGE));
  };

  const userShares = useMemo(() => {
  if (!user || !activePosition) return 0;

  // Find the user's position that matches the active position ID
  const up = userPositions.find(
    pos => pos.positionId === activePosition.id
  );

  return up ? Number(formatEther(BigInt(up.shares))) : 0;
}, [userPositions, activePosition]);

  function getPrice() {
    let sharePrice = "0";

    const counterSharePrice = (index: number) => {
      return toFixed(formatEther(BigInt(counterTerm.vaults[index].current_share_price)));
    }

    const supportSharePrice = (index: number) => {
      return toFixed(formatEther(BigInt(term.vaults[index].current_share_price)));
    }

    if (activeTab === "support") {
      sharePrice = growthType === "linear" ? supportSharePrice(0) : supportSharePrice(1);
    } else {
      sharePrice = growthType === "linear" ? counterSharePrice(0) : counterSharePrice(1);
    }

    return sharePrice;
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
      { args: [term.id as Address, curveId, 0n], view: true } // use "view" to just query
    );
    const [userOpposeShares] = await multiVaultPreviewRedeem(
      { walletClient, publicClient, address },
      { args: [counterTerm.id as Address, curveId, 0n], view: true }
    );
    totalShares += userSupportShares + userOpposeShares;
  }

  setUserShares(formatEther(totalShares));
};

const refreshUserData = async () => {
  if (!user) return;

  const updatedBalance = await getBalance();
  setBalance(updatedBalance);

  await fetchClaim(); // updates userPositions & visiblePositions
};

const handleClaimAction = async () => {
  if (!user) return await handleConnectWallet();

  try {
    const curveId = growthType === "linear" ? 1n : 2n;
    const address = activeTab === "support" ? id : counterTerm.id;

    if (isBuy) {
      if (!buyAmount) throw new Error("No buy amount selected");
      setBuying(true);
      await buyShares(buyAmount, address as Address, curveId);
      setBuying(false);
    } else {
      if (!sellAmount) throw new Error("No sell amount selected");
      setSelling(true);
      await sellShares(sellAmount, address as Address, curveId);
      setSelling(false);
    }

    // Refresh balance and user positions after the tx is mined
    await refreshUserData();

    toast({
      title: "Success",
      description: `Shares ${isBuy ? "bought" : "sold"} successfully!`
    });

  } catch (err: any) {
    console.error(err);
    setBuying(false);
    setSelling(false);
    toast({
      title: "Error",
      description: err.message || `Failed ${isBuy ? "buying" : "selling"} shares`,
      variant: "destructive"
    });
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

  const processedPositions = useMemo(() => {
  let data = [...positions];

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
}, [positions, positionsOption, sortOption]);

const numericBalance = Number(balance);
const hasBalance = numericBalance > 0;


  if (!claim) return <div className="p-3 text-white">Claim not found</div>;

  return (
    <div className="p-3 text-white space-y-6">
      {/* Top Statement */}
      <div className="flex flex-wrap items-center gap-1">
          <img src={term.triple.subject.image} alt="Claim Icon" className="w-16 h-16" />
        <span className="bg-[#0b0618] px-2 py-1 rounded flex items-center gap-1 max-w-[150px] truncate">
          {term.triple.subject.label}
        </span>
        <span>{term.triple.predicate.label}</span>

        <span className="bg-[#0b0618] px-2 py-1 rounded max-w-[150px] truncate">{term.triple.object.label}</span>
      </div>

      <div>
        {/* Total Market Info Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
          {/* Total Market Cap */}
          <div className="flex items-center gap-2">
            <span className="font-semibold opacity-50">Total Market Cap</span>
            <span className="font-bold text-xl text-white">
              {marketCap} TRUST
            </span>
            <img src="/intuition-icon.png" alt="Intuition Icon" className="w-5 h-5" />
          </div>

          {/* Divider */}
          <span className="hidden sm:block border-l border-gray-500 h-6"></span>

          {/* Total Position */}
          <div className="flex items-center gap-2">
            <span className="opacity-50">Total Position:</span>
            <span className="font-semibold">{totalPostions}</span>
          </div>

          {/* Divider */}
          <span className="hidden sm:block border-l border-gray-500 h-6"></span>

          {/* Creator */}
          <div className="flex items-center gap-2">
            <span className="opacity-50">Creator:</span>
            <span className="font-semibold">{term.triple.creator.label}</span>
          </div>

          {/* Share Button */}
          <button
            onClick={() => {
              const textToShare = `${marketCap} TRUST | Total Position: ${totalPostions}`;
              navigator.clipboard.writeText(textToShare)
                .then(() => alert("Copied to clipboard!"))
                .catch(() => alert("Failed to copy."));
            }}
            className="ml-auto px-4 py-2 bg-[#110A2B] border border-[#393B60] rounded-md text-white font-semibold hover:bg-[#1A0F3D] transition-colors duration-200"
          >
            Share
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mt-3">
        {/* Graph Placeholder (70%) */}
        <div className="w-full lg:w-[70%] bg-gradient-to-br from-[#1A0A2B] to-[#0B0515] rounded-xl p-4 shadow-lg">
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-gray-400">Share Price</span>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {getPrice()} TRUST
              </div>
            </div>

{/* Toggle Linear / Exponential */}
<div className="flex rounded-full bg-[#1F123A] p-1">
  {["linear", "exponential"].map((type) => (
    <button
      key={type}
      onClick={() => setGrowthType(type)}
      className={`px-4 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
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

{/* ApexCharts Area Graph - Deep Complex Purple */}
<Chart
  type="area"
  height={280}
  series={[
    {
      name: "Share Price",
      data: generateChartData(claim, growthType).map(d => ({
        x: d.date,
        y: d.value,
      })),
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
      labels: { style: { colors: "#BDAFFF" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { show: true, width: 1, color: "#8B3EFE" },
    },
    yaxis: {
      show: true,
      min: Math.min(...generateChartData(claim, growthType).map(d => d.value)) * 0.95,
      max: Math.max(...generateChartData(claim, growthType).map(d => d.value)) * 1.05,
      labels: { style: { colors: "#BDAFFF" }, formatter: val => val.toFixed(2) },
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
        <div className="w-full lg:w-[30%] bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
          {/* Support / Oppose Tabs */}
          <div className="flex gap-4">
            <button
              className={`flex-1 rounded-md py-2 font-semibold ${activeTab === "support"
                ? "bg-[#0A2D4D] border border-[#006CD2] text-white"
                : "bg-gray-800 border border-gray-700 text-gray-400"
                }`}
              onClick={() => setActiveTab("support")}
            >
              Support
            </button>

            <button
              className={`flex-1 rounded-md py-2 font-semibold ${activeTab === "oppose"
                ? "bg-[#0A2D4D] border border-[#006CD2] text-white"
                : "bg-gray-800 border border-gray-700 text-gray-400"
                }`}
              onClick={() => setActiveTab("oppose")}
            >
              Oppose
            </button>
          </div>

          {/* Buy / Sell Toggle */}
<div className="flex w-full h-max overflow-hidden select-none cursor-pointer bg-[#060210] border border-[#006CD2] rounded-full">
  {/* Buy */}
  <div
    onClick={() => setIsBuy(true)}
    className={`flex-1 flex items-center rounded-full justify-center font-semibold text-base h-6 transition-colors duration-300 ${
      isBuy ? "bg-[#8B3EFE] text-white rounded-l-3xl" : "bg-[#060210] text-white rounded-l-3xl"
    }`}
  >
    Buy
  </div>

  {/* Sell */}
  <div
    onClick={() => setIsBuy(false)}
    className={`flex-1 flex items-center rounded-full justify-center font-semibold text-base h-6 transition-colors duration-300 ${
      !isBuy ? "bg-[#8B3EFE] text-white rounded-r-3xl" : "bg-[#060210] text-white rounded-r-3xl"
    }`}
  >
    Sell
  </div>
</div>

      
{/* Linear Curve Section */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
  <div>
    <h3 className="font-semibold text-white">Linear Curve</h3>
    <p className="text-gray-400 text-xs">Low Risk, Low Reward</p>
  </div>

  {/* Toggle button */}
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
    ></span>
  </button>
  </div>



          {/* Amount Section */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
  <span className="text-gray-400">
    {isBuy ? `Your balance: ${balance}` : `Your shares: ${userShares}`}
  </span>
  <span className="text-gray-400">TRUST</span>
</div>

          {/* Inputs */}
<div className="w-full bg-gray-800 rounded-md border border-[#833AFD] flex items-center px-2">
  <input
    type="text"
    placeholder="0.1"
    disabled={!hasBalance}
    onChange={(e) =>
      isBuy ? setBuyAmount(e.target.value) : setSellAmount(e.target.value)
    }
    className={`flex-1 bg-gray-800 text-white p-2 outline-none ${
      !hasBalance ? "opacity-50 cursor-not-allowed" : ""
    }`}
  />
  <span className="text-gray-400 ml-2">min</span>
</div>

{!hasBalance && (
  <div className="mt-2 text-sm text-red-400 font-semibold">
    You shall NOT pass! Get some TRUST.
  </div>
)}
          <div className="w-full bg-gray-800 border border-[#833AFD] rounded-md px-3 py-2 flex items-center justify-between text-white text-sm">
  {/* Left label */}
  <span>Amount you receive</span>

  {/* Right value with spinner */}
  <div className="flex items-center gap-2">
    {loadingAmount ? (
      <svg
        className="w-4 h-4 animate-spin text-gray-400"
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
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    ) : (
      <span>{amountToReceive}</span>
    )}
  </div>
</div>

          {/* Connect / Buy / Sell Button */}
<button
  onClick={async () => {
    if (!user) {
      await handleConnectWallet();
      return;
    }
    await handleClaimAction();
  }}
  className="flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-3xl"
>
  {!user && (
    <img src="/key.png" alt="Key Icon" className="w-5 h-5" />
  )}

  {user
    ? isBuy
      ? buying
        ? "Buying"
        : "Buy"
      : selling
      ? "Selling"
      : "Sell"
    : "Connect Wallet"}
</button>
        </div>
      </div>

      
      {/* Your Position Card */}
<div className="bg-[#110A2B] rounded-xl p-4 flex flex-col gap-4">
  <div className="flex items-center gap-3 text-white text-base font-semibold">
    <span>Your Position</span>
    <div className="w-6 h-[3px] bg-[#AD77FF] rounded-full"></div>

    {userPositions.length > 0 ? (
      <>
        <span>
          Support:{" "}
          <span className="font-bold">
            {toFixed(
              userPositions
                .filter(p => p.direction === "support")
                .reduce((sum, p) => sum + parseFloat(formatEther(BigInt(p.shares))), 0)
            )}{" "}
            TRUST
          </span>
        </span>
        <span>
          Oppose:{" "}
          <span className="font-bold">
            {toFixed(
              userPositions
                .filter(p => p.direction === "oppose")
                .reduce((sum, p) => sum + parseFloat(formatEther(BigInt(p.shares))), 0)
            )}{" "}
            TRUST
          </span>
        </span>
      </>
    ) : (
      <span className="text-gray-400 font-semibold">No positions found</span>
    )}
  </div>

  <div className="h-px w-full bg-white opacity-80"></div>
</div>

      {/* Support Position Card */}
      <div className="bg-[#110A2B] rounded-xl p-5 3 flex flex-col gap-3 text-white">

        {/* Title Section */}
        <div>
          <h3 className="font-semibold text-base">Support Position</h3>
          <p className="text-gray-400 text-xs">The Ticker (Progressive)</p>
        </div>

        {/* Position Summary Card */}
<div className="bg-[#110A2B] rounded-xl p-5 flex flex-col gap-4 text-white">
  {/* Row 1: Support / Oppose Percent */}
  <div className="flex justify-between text-sm font-semibold text-gray-400">
    <span>Support: {supportPercent.toFixed(2)}%</span>
    <span>Oppose: {opposePercent.toFixed(2)}%</span>
  </div>

  {/* Row 2: Table Header */}
  <div className="grid grid-cols-5 gap-3 text-gray-400 text-xs font-semibold border-b border-gray-700 pb-2">
    <span>Side</span>
    <span>Curve</span>
    <span>Price / Share</span>
    <span>Mkt Cap</span>
    <span>Holders</span>
  </div>

  {/* Row 3: FOR */}
  <div className="grid grid-cols-5 gap-3 items-center py-2">
    <span className="flex items-center gap-2 font-semibold">
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      FOR
    </span>
    <span>Exponential</span>
    <span>{term.vaults?.[1]?.current_share_price ? toFixed(formatEther(BigInt(term.vaults[1].current_share_price))) : "-"}</span>
    <span>{marketCap}</span>
    <span>{term.vaults?.[1]?.holders?.length ?? 0}</span>
  </div>

  {/* Row 4: AGAINST */}
  <div className="grid grid-cols-5 gap-3 items-center py-2">
    <span className="flex items-center gap-2 font-semibold">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      AGAINST
    </span>
    <span>Exponential</span>
    <span>{counterTerm.vaults?.[1]?.current_share_price ? toFixed(formatEther(BigInt(counterTerm.vaults[1].current_share_price))) : "-"}</span>
    <span>{marketCap}</span>
    <span>{counterTerm.vaults?.[1]?.holders?.length ?? 0}</span>
  </div>

  {/* Row 5: FOR Linear */}
  <div className="grid grid-cols-5 gap-3 items-center py-2">
    <span className="flex items-center gap-2 font-semibold">
      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
      FOR
    </span>
    <span>Linear</span>
    <span>{term.vaults?.[0]?.current_share_price ? toFixed(formatEther(BigInt(term.vaults[0].current_share_price))) : "-"}</span>
    <span>{marketCap}</span>
    <span>{term.vaults?.[0]?.holders?.length ?? 0}</span>
  </div>

  {/* Row 6: AGAINST Linear */}
  <div className="grid grid-cols-5 gap-3 items-center py-2">
    <span className="flex items-center gap-2 font-semibold">
      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
      AGAINST
    </span>
    <span>Linear</span>
    <span>{counterTerm.vaults?.[0]?.current_share_price ? toFixed(formatEther(BigInt(counterTerm.vaults[0].current_share_price))) : "-"}</span>
    <span>{marketCap}</span>
    <span>{counterTerm.vaults?.[0]?.holders?.length ?? 0}</span>
  </div>
</div>
      </div>

      {/* Positions on this Claim Section */}
      <div className="bg-[#110A2B] rounded-xl p-5 text-white flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-2 justify-start">
          <button
            className={`rounded-md py-2 px-4 font-semibold ${activeTab === "all"
              ? "bg-[#0A2D4D] border border-[#006CD2] text-white"
              : "bg-gray-800 border border-gray-700 text-gray-400"
              }`}
            onClick={() => setActiveTab("all")}
          >
            All Positions
          </button>

          <button
            className={`rounded-md py-2 px-4 font-semibold ${activeTab === "my"
              ? "bg-[#0A2D4D] border border-[#006CD2] text-white"
              : "bg-gray-800 border border-gray-700 text-gray-400"
              }`}
            onClick={() => setActiveTab("my")}
          >
            My Position
          </button>
        </div>



        {/* Dynamic Heading */}
        <h3 className="font-semibold text-base">
          {activeTab === "all"
            ? "All Positions on this Claim"
            : "My Position on this Claim"}
        </h3>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Positions Input */}
          <input
            type="text"
            placeholder="Search positions"
            className="w-full lg:w-1/2 bg-[#06021A] border border-[#393B60] text-white p-2 rounded-2xl outline-none"
          />

          {/* Positions / Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">Positions:</span>

            <div className="relative w-48">
              <select
                value={positionsOption}
                onChange={(e) => setPositionsOption(e.target.value)}
                className="appearance-none w-full bg-[#06021A] border border-[#393B60] rounded-2xl px-4 py-2 pr-10 text-white focus:outline-none"
              >
                <option value="all">All</option>
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
                <option value="support">Support</option>
                <option value="oppose">Oppose</option>
              </select>

              {/* Icon inside the select */}
              <img
                src="/up-down.png"
                alt="Dropdown"
                className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          {/* Sort Input */}
          {/* Sort Dropdown */}
<div className="flex items-center gap-2">
  <span className="text-white font-semibold">Sort:</span>
  
  <div className="relative w-48">
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className="appearance-none w-full bg-[#06021A] border border-[#393B60] rounded-2xl px-4 py-2 pr-10 text-white focus:outline-none"
    >
      <option value="highest_shares">Highest Shares</option>
      <option value="lowest_shares">Lowest Shares</option>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="a_to_z">A - Z</option>
      <option value="z_to_a">Z - A</option>
    </select>

    {/* Dropdown Icon */}
    <img
      src="/up-down.png"
      alt="Dropdown"
      className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    />
  </div>
</div>
        </div>


        {/* TABLE */}
<div className="overflow-x-auto">
  <div className="min-w-[700px]">
    {processedPositions.length === 0 ? (
  <div className="text-gray-400 text-center py-4">No positions found</div>
) : (
  <div className="flex flex-col gap-2">

    <div className="bg-[#060210] p-3 rounded-md flex items-center text-gray-400 font-semibold text-xs">
      <div className="w-[5%] text-center">#</div>
      <div className="w-[35%]">Account</div>
      <div className="w-[15%] text-center">Curve</div>
      <div className="w-[15%] text-center">Direction</div>
      <div className="w-[20%] text-right">Shares</div>
    </div>

    {processedPositions.map((pos, idx) => (
      <div
        key={idx}
        className="bg-[#110A2B] p-4 rounded-md flex items-center text-white"
      >
        <div className="w-[5%] text-gray-400 font-semibold text-center">
          {idx + 1}
        </div>

        <div className="w-[35%] flex items-center gap-2 truncate">
          {pos.account?.image && (
            <img
              src={pos.account.image}
              alt={pos.account.label ?? "User"}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
          )}
          <span className="font-semibold truncate">
            {pos.account?.label ?? pos.account?.id ?? "Anonymous"}
          </span>
        </div>

        <div className="w-[15%] text-center text-gray-400">
          {Number(pos.curve_id) === 1
            ? "Linear"
            : Number(pos.curve_id) === 2
            ? "Exponential"
            : "—"}
        </div>

        <div className="w-[15%] text-center font-semibold">
          {pos.direction?.toLowerCase() === "support"
            ? "Support"
            : pos.direction?.toLowerCase() === "oppose"
            ? "Oppose"
            : "—"}
        </div>

        <div className="w-[20%] text-right font-semibold">
          {pos.shares
            ? `${toFixed(formatEther(BigInt(pos.shares)))}`
            : ""}
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
