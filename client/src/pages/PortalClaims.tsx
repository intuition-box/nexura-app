import { useState, useEffect, useRef, useMemo } from "react";
import { Address, formatEther } from "viem";
import { buyShares, sellShares } from "../services/web3";
import { apiRequestV2 } from "../lib/queryClient";
// import type { Term } from "../types/types";
import { useToast } from "../hooks/use-toast";
import { formatNumber } from "../lib/utils";
import { useLocation } from "wouter";
import { getPublicClient } from "../lib/viem";
import { useAuth } from "../lib/auth";
import { Term, Position } from "../types/types";

interface Claim {
  user: { address: Address };
  term_id: Address;
  counter_term_id: Address;
  total_market_cap: string;
  total_position_count: string;
  total_assets: string;
  term: Term;
  counter_term: Term;
}

export const toFixed = (num: string) => {
  const parseNumber = parseFloat(num).toFixed(2);
  return parseFloat(parseNumber).toLocaleString();
}

export default function PortalClaims() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [view, setView] = useState("list");
  const [sortOption, setSortOption] = useState('{"total_market_cap":"desc"}');
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [termId, setTermId] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "redeem">("deposit");
  const [isToggled, setIsToggled] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]); 
  const [userPositions, setUserPositions] = useState<Position[]>([]);
  const [totalPostions, setTotalPositions] = useState("0");
  const [visibleClaims, setVisibleClaims] = useState<Claim[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewRedeemModal, setShowReviewRedeemModal] = useState(false);
  const [showReviewDepositModal, setShowReviewDepositModal] = useState(false);
    const [transactionMode, setTransactionMode] = useState("redeem");
    const [opposeMode, setOpposeMode] = useState(false);
    const [transactionAmount, setTransactionAmount] = useState("");
      // Wallet & Blockchain
    const [tTrustBalance, setTTrustBalance] = useState<bigint>(0n);
    const [inputValue, setInputValue] = useState(0);
    const [sortedClaims, setSortedClaims] = useState(visibleClaims);
    const [showCurveInfo, setShowCurveInfo] = useState(false);
    const [activePosition, setActivePosition] = useState<bigint>(0n);
    const [modalStep, setModalStep] = useState<
  "review" | "awaiting" | "success" | "failed"
>("review");
// Example state to store totals
const [userShares, setUserShares] = useState<{ support: bigint; oppose: bigint }>({ support: 0n, oppose: 0n });
    
// localstorage stuff
const [actionState, setActionState] = useState<Record<string, "none" | "supported" | "opposed">>(() => {
  const saved = localStorage.getItem("actionState");
  return saved ? JSON.parse(saved) : {};
});
 const [userSharesByCurve, setUserSharesByCurve] = useState<{
  support: { linear: bigint; exponential: bigint };
  oppose: { linear: bigint; exponential: bigint };
}>({
  support: { linear: 0n, exponential: 0n },
  oppose: { linear: 0n, exponential: 0n },
});
const [supportShares, setSupportShares] = useState<{ linear: bigint; exponential: bigint }>({ linear: 0n, exponential: 0n });
const [opposeShares, setOpposeShares] = useState<{ linear: bigint; exponential: bigint }>({ linear: 0n, exponential: 0n });

// Whenever state changes, we save it
useEffect(() => {
  localStorage.setItem("actionState", JSON.stringify(actionState));
}, [actionState]);

    async function fetchWalletBalance(address: Address) {
  const publicClient = getPublicClient();
  const balance = await publicClient.getBalance({ address });
  return balance ?? 0n;
}

useEffect(() => {
  (async () => {
    if (!user?.address) return;

    try {
      const balance = await fetchWalletBalance(user.address);
      setTTrustBalance(balance);
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    }
  })();
}, [user?.address]);

useEffect(() => {
  setSortedClaims(sortClaims(visibleClaims, sortOption));
}, [visibleClaims, sortOption]);

      // Returns true if claim matches search
const claimMatchesSearch = (claim: Claim, term: string) => {
  const lower = term.toLowerCase();
  return (
    claim.term.triple.subject.label.toLowerCase().includes(lower) ||
    claim.term.triple.predicate.label.toLowerCase().includes(lower) ||
    claim.term.triple.object.label.toLowerCase().includes(lower)
  );
};

const highlightMatch = (text: string, term: string) => {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bg-yellow-400 text-black px-0.5 rounded">{part}</span>
    ) : (
      part
    )
  );
};

  const { toast } = useToast();

  const LIMIT = 50;

//   // ----------------- Utility Function -----------------
// const fetchUserPositionsForClaim = (claim: Claim, user: User) => {
//   if (!user) return { positions: [], sharesByCurve: { support: { linear: 0n, exponential: 0n }, oppose: { linear: 0n, exponential: 0n } } };

//   const positions: Position[] = [];

//   // --- Support ---
//   claim.term.vaults?.forEach((vault) => {
//     (vault.userPosition ?? []).forEach((p) => {
//       positions.push({
//         account: p.account_id,
//         shares: p.shares,
//         curve: vault.curve_id,
//         direction: "support",
//       });
//       console.log("SUPPORT POSITION", { account: p.account_id, shares: p.shares, curve: vault.curve_id });
//     });
//   });

//   // --- Oppose ---
//   claim.counter_term.vaults?.forEach((vault) => {
//     (vault.userPosition ?? []).forEach((p) => {
//       positions.push({
//         account: p.account_id,
//         shares: p.shares,
//         curve: vault.curve_id,
//         direction: "oppose",
//       });
//       console.log("OPPOSE POSITION", { account: p.account_id, shares: p.shares, curve: vault.curve_id });
//     });
//   });

//   // Compute shares by curve
//   const sharesByCurve = positions.reduce(
//     (acc, p) => {
//       const s = BigInt(p.shares ?? 0);
//       if (p.direction === "support") {
//         p.curve === "1" ? (acc.support.linear += s) : (acc.support.exponential += s);
//       } else {
//         p.curve === "1" ? (acc.oppose.linear += s) : (acc.oppose.exponential += s);
//       }
//       return acc;
//     },
//     { support: { linear: 0n, exponential: 0n }, oppose: { linear: 0n, exponential: 0n } }
//   );

//   console.log(`Normalized user positions for claim: ${claim.id}`, positions);
//   console.log(`Shares by curve for claim: ${claim.id}`, sharesByCurve);

//   return { positions, sharesByCurve };
// };

const loadMore = async () => {
  if (loading || !hasMore) return;
  setLoading(true);

  try {
    const searchQuery = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";
    const { claims } = await apiRequestV2(
      "GET",
      `/api/get-claims?filter=${sortOption}&offset=${offset}${searchQuery}`
    );

    if (!user) {
      setUserPositions([]);
      setActivePosition(0n);
      setUserSharesByCurve({
        support: { linear: 0n, exponential: 0n },
        oppose: { linear: 0n, exponential: 0n },
      });
      console.log("No user signed in, resetting positions and sharesByCurve");
      return;
    }

if (claims.length > 0) {
  // const { positions, sharesByCurve } = fetchUserPositionsForClaim(claims[0], user);
  setUserPositions(positions);
  setUserSharesByCurve(sharesByCurve);
  console.log("Updated userPositions and userSharesByCurve state");
}
    // Handle pagination
    if (claims.length === 0 || claims.length < LIMIT) {
      setHasMore(false);
      console.log("No more claims to load, hasMore set to false");
    } else {
      setOffset(prev => prev + claims.length);
      console.log(`Incrementing offset by ${claims.length}, new offset: ${offset + claims.length}`);
    }

  } catch (err) {
    console.error("Failed to load positions:", err);
  } finally {
    setLoading(false);
    console.log("Loading finished, loading state set to false");
  }
};


// Call whenever user changes
useEffect(() => {
  if (user) {
    setOffset(0);
    setUserPositions([]);
    setHasMore(true);
    loadMore();
  } else {
    setUserPositions([]);
    setActivePosition(0n);
  }
}, [user]);

useEffect(() => {
  const resetAndLoad = async () => {
    setLoading(true);
    setOffset(0);
    setHasMore(true);

    try {
      const searchQuery = searchTerm
        ? `&search=${encodeURIComponent(searchTerm)}`
        : "";

      const { claims } = await apiRequestV2(
        "GET",
        `/api/get-claims?filter=${sortOption}&offset=0${searchQuery}`
      );

      const filteredClaims = claims.filter((claim: Claim) =>
        claimMatchesSearch(claim, searchTerm)
      );

      setVisibleClaims(filteredClaims);
      setOffset(LIMIT);
      setHasMore(filteredClaims.length >= LIMIT);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  resetAndLoad();
}, [sortOption, searchTerm]);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore();
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
  }, [loading, hasMore, sortOption]);

  useEffect(() => {
    loadMore();
  }, [sortOption]);

const inputRef = useRef(null);

// optional: focus programmatically if you need more control
useEffect(() => {
  if (showModal && inputRef.current) {
    inputRef.current.focus();
  }
}, [showModal]);

const formatTrust = (shares: bigint, decimals = 18, precision = 2) => {
  const divisor = 10n ** BigInt(decimals);
  const formatted = Number(shares) / Number(divisor);
  return formatted.toFixed(precision);
};

  // ---------------- Handlers ----------------
const handleSupportClick = (claim: Claim) => {
  if (!user) return;

  setActiveClaim(claim);
  setTermId(claim.term.id);
  setOpposeMode(false);
  setTransactionAmount("");

  let linear = 0n;
  let exponential = 0n;

  claim.term.vaults?.forEach((vault) => {
    const curveId = String(vault.curve_id).trim();

    (vault.userPosition ?? []).forEach((p) => {
      if (p.account_id.toLowerCase() === user.address.toLowerCase()) {
        const shares = BigInt(p.shares);
        if (curveId === "1") linear += shares;
        if (curveId === "2") exponential += shares;
      }
    });
  });

  console.log("Support Linear:", linear.toString(), "Exponential:", exponential.toString());

  setSupportShares({ linear, exponential });

  // Set active position to the currently toggled curve
  setActivePosition(isToggled ? exponential : linear);

  setShowModal(true);
};

const handleOpposeClick = (claim: Claim) => {
  if (!user) return;

  setActiveClaim(claim);
  setTermId(claim.counter_term.id);
  setTransactionMode("redeem");
  setActiveTab("deposit");
  setOpposeMode(true);
  setTransactionAmount("");

  let linear = 0n;
  let exponential = 0n;

  claim.counter_term.vaults?.forEach((vault) => {
    const curveId = String(vault.curve_id).trim();

    (vault.userPosition ?? []).forEach((p) => {
      if (p.account_id.toLowerCase() === user.address.toLowerCase()) {
        const shares = BigInt(p.shares);
        if (curveId === "1") linear += shares;
        if (curveId === "2") exponential += shares;
      }
    });
  });

  console.log("Oppose Linear:", linear.toString(), "Exponential:", exponential.toString());

  setOpposeShares({ linear, exponential });

  // Set active position to currently toggled curve
  setActivePosition(isToggled ? exponential : linear);

  setShowModal(true);
};

const displayedShares = opposeMode
  ? (isToggled ? opposeShares.exponential : opposeShares.linear)
  : (isToggled ? supportShares.exponential : supportShares.linear);

    const handleCloseModal = () => {
      setActiveClaim(null);
      setShowModal(false);
      setOpposeMode(false);
    };

    const maxRedeemable = Number(displayedShares) / 10 ** 18;

const handleClaimAction = async (action: "deposit" | "redeem" = "deposit") => {
  if (!termId) return;

  try {
    setModalStep("awaiting");

    const addressTermId = termId as Address;

    if (action === "deposit") {
      await buyShares(transactionAmount, addressTermId, isToggled ? 2n : 1n);
    } else {
      await sellShares(transactionAmount, addressTermId, isToggled ? 2n : 1n);
    }

    const actionText = opposeMode ? "opposed" : "supported";

    toast({
      title: "Success",
      description: `Successfully ${actionText} a claim!`,
    });

    setActionState(prev => ({
      ...prev,
      [termId]: opposeMode ? "opposed" : "supported"
    }));

     setTransactionAmount("");
    setModalStep("success");

  } catch (err: any) {
    console.error(err);

    setModalStep("failed"); 

    toast({
      title: "Error",
      description: err?.message || "Transaction failed",
      variant: "destructive",
    });
  }
};

// Sorting function
const sortClaims = (claims, option) => {
  const sorted = [...claims]; // clone to avoid mutating original
  switch (option) {
    case "totalMarketCap_desc":
      return sorted.sort((a, b) => Number(b.total_market_cap) - Number(a.total_market_cap));
    case "totalMarketCap_asc":
      return sorted.sort((a, b) => Number(a.total_market_cap) - Number(b.total_market_cap));
    case "supportMarketCap_desc":
      return sorted.sort((a, b) =>
        Number(b.term.total_assets) - Number(a.term.total_assets)
      );
    case "supportMarketCap_asc":
      return sorted.sort((a, b) =>
        Number(a.term.total_assets) - Number(b.term.total_assets)
      );
    case "opposeMarketCap_desc":
      return sorted.sort((a, b) =>
        Number(b.counter_term.total_assets) - Number(a.counter_term.total_assets)
      );
    case "opposeMarketCap_asc":
      return sorted.sort((a, b) =>
        Number(a.counter_term.total_assets) - Number(b.counter_term.total_assets)
      );
    case "positions_desc":
      return sorted.sort(
        (a, b) =>
          (b.total_position_count || 0) - (a.total_position_count || 0)
      );
    case "positions_asc":
      return sorted.sort(
        (a, b) =>
          (a.total_position_count || 0) - (b.total_position_count || 0)
      );
    case "createdAt_desc":
      return sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case "createdAt_asc":
      return sorted.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    default:
      return claims;
  }
};

// Determine if the user has any active shares in the current direction
const hasAnyPosition =
  (supportShares.linear + supportShares.exponential > 0n) ||
  (opposeShares.linear + opposeShares.exponential > 0n);
  console.log("Has any position:", hasAnyPosition, supportShares, opposeShares);

  return (
    <div className="p-3 text-white font-geist">
      {/* Header */}
      <h1 className="text-base font-semibold">Claims</h1>

      <p className="text-gray-400 mt-2 max-w-xl text-xs">
        Semantic statements, allowing anyone to claim anything about anything
      </p>

      {/* Controls Section */}
      <div className="mt-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mb-2">

        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <input
  type="text"
  placeholder="Search claims by subject, predicate, or object.."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
/>
        </div>

        {/* Grid/List Toggle */}
        <div className="hidden md:flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1 ${view === "list" ? "bg-gray-900" : ""}`}
          >
            <img src="/list.png" alt="List View" className="w-5 h-5" />
          </button>

          <button
            onClick={() => setView("grid")}
            className={`px-3 py-1 ${view === "grid" ? "bg-gray-900" : ""}`}
          >
            <img src="/grid.png" alt="Grid View" className="w-5 h-5" />
          </button>
        </div>

        {/* Market Cap Dropdown */}
        <div className="relative w-full sm:w-auto">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="appearance-none bg-gray-900 border border-gray-700 rounded-lg px-4 py-1 pr-10 focus:outline-none text-xs"
          >
            <option value="totalMarketCap_desc">Highest Total Market Cap</option>
            <option value="totalMarketCap_asc">Lowest Total Market Cap</option>

            <option value="supportMarketCap_desc">Highest Support Market Cap</option>
            <option value="supportMarketCap_asc">Lowest Support Market Cap</option>

            <option value="opposeMarketCap_desc">Highest Oppose Market Cap</option>
            <option value="opposeMarketCap_asc">Lowest Oppose Market Cap</option>

            <option value="positions_desc">Most Positions</option>
            <option value="positions_asc">Fewest Positions</option>

            <option value="createdAt_desc">Newest</option>
            <option value="createdAt_asc">Oldest</option>
          </select>

          <img
            src="/up-down.png"
            alt="Sort"
            className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-70"
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="mt-4 overflow-x-auto text-xs">
        <div className="mt-8 text-xs">
          {view === "list" && (
            <>
              {/* ================= DESKTOP TABLE ================= */}
              <div className="hidden md:block overflow-x-auto w-full font-geist text-xs">
                <table className="min-w-full text-left border-collapse">
                  <thead className="text-sm">
                    <tr className="bg-gray-800 text-gray-300">
                      <th className="px-16 py-2">Claims</th>
                      <th className="px-4 py-2">Market Cap</th>
                      <th className="px-4 py-2">Support</th>
                      <th className="px-4 py-2">Oppose</th>
                      <th className="px-16 py-2">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-xs">
  {sortedClaims.map((claim, index) => (
    <tr
      key={index}
      className="bg-[#060210] hover:bg-[#1a0f2e] cursor-pointer font-geist"
    >
      {/* Claim cell: clickable to navigate */}
      <td
        className="px-4 py-3"
        onClick={() => setLocation(`/portal-claims/${claim.term_id}`)}
      >
        <div className="flex flex-wrap items-center gap-2 font-geist">
          <span className="bg-[#0b0618] px-2 py-1 rounded flex items-center gap-1 max-w-[150px] truncate">
            <img src={claim.term.triple.subject.image} className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{highlightMatch(claim.term.triple.subject.label, searchTerm)}</span>
          </span>
          <span className="max-w-[120px] truncate">{highlightMatch(claim.term.triple.predicate.label, searchTerm)}</span>
          <span className="bg-[#0b0618] px-2 py-1 rounded max-w-[150px] truncate">
            {highlightMatch(claim.term.triple.object.label, searchTerm)}
          </span>
        </div>
      </td>

      {/* Market Cap */}
      <td className="px-4 py-3 font-semibold font-geist">
        {formatNumber(parseFloat(formatEther(BigInt(claim.total_market_cap))))} TRUST
      </td>

      {/* Support / Oppose Stats */}
      <td className="px-4 py-3 text-blue-400 font-semibold">
        <div className="flex items-center gap-2">
          <img src="/user.png" className="w-4 h-4" />
          {formatNumber(claim.term.positions_aggregate.aggregate.count, "user")}
        </div>
      </td>
      <td className="px-4 py-3 text-[#F19C03] font-semibold">
        <div className="flex items-center gap-2">
          <img src="/user-red.png" className="w-4 h-4" />
          {formatNumber(claim.counter_term.positions_aggregate.aggregate.count, "user")}
        </div>
      </td>

      {/* Actions: buttons only */}
      <td className="px-4 py-3 text-center text-xs">
  <div className="flex justify-center gap-2">
{/* Support Button */}
<button
  className={`px-4 py-2 rounded-lg text-xs transition-all
    ${
      actionState[claim.term.id] === "supported"
        ? "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white" // hovered reverts
        : "bg-blue-600 text-white hover:brightness-110"
    }`}
  onClick={(e) => {
    e.stopPropagation();
    handleSupportClick(claim);
  }}
>
  {actionState[claim.term.id] === "supported" ? "Supported" : "Support"}
</button>

{/* Oppose Button */}
<button
  className={`px-4 py-2 rounded-lg text-xs transition-all
    ${
      actionState[claim.counter_term.id] === "opposed"
        ? "bg-transparent text-[#F19C03] border border-[#F19C03] hover:bg-[#F19C03] hover:text-white"
        : "bg-[#F19C03] text-white hover:brightness-110"
    }`}
  onClick={(e) => {
    e.stopPropagation();
    handleOpposeClick(claim);
  }}
>
  {actionState[claim.counter_term.id] === "opposed" ? "Opposed" : "Oppose"}
</button>
  </div>
</td>
    </tr>
  ))}
</tbody>
                </table>
              </div>

              {/* ================= MOBILE STACKED LIST ================= */}
              <div className="md:hidden flex flex-col gap-4">
                {sortedClaims.map((claim, index) => (
                  <div
                    key={index}
                    className="bg-[#060210] border border-gray-700 rounded-xl p-4 hover:bg-[#1a0f2e] cursor-pointer"
                    onClick={() => setLocation(`/portal-claims/${claim.term_id}`)}
                  >
                    {/* Claim Statement */}
                    <div className="flex flex-wrap gap-2 mb-3 text-sm">
                      <span className="bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                        <img src={claim.term.triple.subject.image} className="w-5 h-5" />
                        {claim.term.triple.subject.label}
                      </span>
                      {claim.term.triple.predicate.label}
                      <span className="bg-gray-700 px-2 py-1 rounded">
                        {claim.term.triple.object.label}
                      </span>
                    </div>

                    {/* Market Cap */}
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Market Cap</span>
                      <span className="font-semibold">
                        {toFixed(formatEther(BigInt(claim.total_market_cap)))} TRUST
                      </span>
                    </div>

                    {/* Support / Oppose */}
                    <div className="flex justify-between text-sm mb-3">
                      <div className="text-blue-400 font-semibold">
                        Support: {formatNumber(claim.term.positions_aggregate.aggregate.count)}
                      </div>

                      <div className="text-[#F19C03] font-semibold">
                        Oppose: {formatNumber(claim.counter_term.positions_aggregate.aggregate.count)}
                      </div>
                    </div>

                    {/* Action Buttons */}
<div className="flex justify-center gap-2">
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleSupportClick(claim); // open modal
    }}
    className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center"
  >
    <img src="/support.png" alt="Support" className="w-4 h-4" />
  </button>

  <button
    onClick={(e) => {
      e.stopPropagation();
      handleOpposeClick(claim); // open modal
    }}
    className="h-8 w-8 bg-[#F19C03] rounded-lg flex items-center justify-center"
  >
    <img src="/oppose.png" alt="Oppose" className="w-4 h-4" />
  </button>
</div>
                  </div>
                ))}
              </div>
            </>
          )}
                    {view === "grid" && (
          <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3">
            {sortedClaims.map((claim) => {
              const supportCount = Number(claim.term.positions_aggregate.aggregate.count);
              const opposeCount = Number(claim.counter_term.positions_aggregate.aggregate.count);

              const total = supportCount + opposeCount;
              const supportPercent = total > 0 ? (supportCount / total) * 100 : 0;
              const opposePercent = total > 0 ? (opposeCount / total) * 100 : 0;

              return (
                <div
                  key={claim.term_id}
                  className="bg-[#060210] border border-gray-700 rounded-xl p-4 hover:bg-[#2c0738] transition"
                >
                  {/* Statement */}
                  <div className="text-gray-300 mb-4 flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xl bg-[#0b0618] px-2 py-1 rounded mr-2 max-w-[40%] truncate">
                      {claim.term.triple.subject.label}
                    </span>
                    {claim.term.triple.predicate.label}
                    <span className="bg-[#0b0618] px-2 py-1 rounded ml-2 max-w-[40%] truncate">
                      {claim.term.triple.object.label}
                    </span>
                  </div>
                  {/* Stats Section */}
                  <div className="flex overflow-hidden rounded-md">

                    {/* Support */}
                    <div className="flex-1 flex flex-col p-2 gap-1">
                      <span className="text-blue-400 font-semibold">Support</span>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{toFixed(formatEther(BigInt(claim.term.total_assets)))} TRUST</span>
                        <div className="flex items-center gap-1 text-blue-400 font-semibold">
                          <span>{formatNumber(claim.term.positions_aggregate.aggregate.count)}</span>
                          <img src="/user.png" alt="User Icon" className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Vertical Separator */}
                    <div className="w-px bg-white"></div>

                    {/* Oppose */}
                    <div className="flex-1 flex flex-col p-2 gap-1">
                      <span className="text-[#F19C03] font-semibold">Oppose</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F19C03]">{toFixed(formatEther(BigInt(claim.counter_term.total_assets)))} TRUST</span>
                        <div className="flex items-center gap-1 text-[#F19C03] font-semibold">
                          <span>{formatNumber(claim.counter_term.positions_aggregate.aggregate.count)}</span>
                          <img
                            src="/user-red.png"
                            alt="User Icon"
                            className="w-4 h-4"
                            style={{ filter: "invert(51%) sepia(90%) saturate(4515%) hue-rotate(2deg) brightness(97%) contrast(96%)" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-5 bg-gray-700 rounded-lg overflow-hidden mt-2 relative">
                    <div className="flex h-full text-white text-xs font-semibold">

                      {supportPercent > 0 && (
                        <div
                          className="bg-blue-600 flex items-center justify-center transition-all duration-500"
                          style={{ width: `${supportPercent}%` }}
                        >
                          {supportPercent > 8 && `${supportPercent.toFixed(1)}%`}
                        </div>
                      )}

                      {opposePercent > 0 && (
                        <div
                          className="bg-[#F19C03] flex items-center justify-center transition-all duration-500"
                          style={{ width: `${opposePercent}%` }}
                        >
                          {opposePercent > 8 && `${opposePercent.toFixed(1)}%`}
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Actions */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-700">


                      {/* Action Buttons */}
<div className="flex justify-center gap-2">
          <button
            className="bg-blue-600 px-4 py-2 rounded-lg text-sm pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleSupportClick(claim);
            }}
          >
            Support
          </button>

          <button
            className="bg-[#F19C03] px-4 py-2 rounded-lg text-sm pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleOpposeClick(claim);
            }}
          >
            Oppose
          </button>
</div>

                    {/* Total MarketCap */}
                    <div className="flex flex-col items-end text-gray-300 text-sm">
                      <span className="font-semibold">Total Market Cap</span>
                      <span className=" text-lg text-white">
                        {toFixed(
                          formatEther(
                            BigInt(claim.total_market_cap)
                          )
                        )} TRUST
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
            )}

          {/* Modal */}
  {showModal && activeClaim && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
<div className="bg-[#070315] max-w-2xl w-full mx-4 p-6 rounded-lg relative border h-[calc(100vh-8rem)] overflow-y-auto">

      {/* Title + Support Tag */}
      <div className="flex items-center gap-2 mb-1 p-2 pb-1">
        <h2 className="text-white font text-base">Stake</h2>
<span
  className="bg-[#0A2D4D] text-white text-[9px] px-1 py-[1px] rounded-full cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#0A2D4D] hover:border-[#0A2D4D]"
>
  {opposeMode ? "Oppose" : "Support"}
</span>
      </div>

      {/* Subtitle */}
      <p className="text-gray-400 text-xs mb-12 -pt-2">
        Staking on a Triple enhances its discoverability in the Intuition system
      </p>

{/* Statement */}
<div className="text-gray-300 mb-6 px-6 flex flex-wrap items-center justify-center gap-2 text-sm">
  <span className="font-bold bg-[#0b0618] hover:bg-[#140a25] transition-colors duration-200 px-3 py-1.5 rounded inline-flex items-center gap-2 max-w-[200px] truncate">
    <img
      src={activeClaim.term.triple.subject.image}
      alt="Claim Icon"
      className="w-5 h-5 object-contain"
    />
    {activeClaim.term.triple.subject.label}
  </span>

  <span>{activeClaim.term.triple.predicate.label}</span>

  <span className="bg-[#0b0618] hover:bg-[#140a25] transition-colors duration-200 px-3 py-1.5 rounded max-w-[200px] truncate">
    {activeClaim.term.triple.object.label}
  </span>
</div>

{/* Tabs */}
<div className="flex justify-center mb-5">
  <div className="flex gap-12 relative">

    {/* Deposit Tab */}
    <button
      className={`relative px-6 py-3 text-base font-medium ${
        activeTab === "deposit" ? "text-white" : "text-gray-400"
      }`}
      onClick={() => setActiveTab("deposit")}
    >
      Deposit
      {activeTab === "deposit" && (
        <span
          className="absolute left-1/2 bottom-0 w-48 h-0.5 transform -translate-x-1/2 bg-blue-500 rounded-full"
        ></span>
      )}
    </button>

    {/* Redeem Tab */}
<button
  className={`relative px-6 py-3 text-base font-medium ${
    activeTab === "redeem"
      ? "text-white"
      : hasAnyPosition
      ? "text-gray-400 hover:text-white cursor-pointer"
      : "text-gray-600 cursor-not-allowed"
  }`}
  onClick={() => {
    if (hasAnyPosition) setActiveTab("redeem");
  }}
  disabled={!hasAnyPosition}
>
  Redeem
</button>

  </div>
</div>


{/* Tab Content */}
{activeTab === "deposit" && (
  <div className="px-4 md:px-12">
{/* Main Card: Active Position */}
<div className="flex justify-center mb-4">
  <div className="bg-[#110A2B] border-2 border-[#393B60] p-2 rounded-lg flex items-center justify-between gap-6 font-geist mt-4 w-[380px]">
    
    <span className="text-gray-300 text-xs whitespace-nowrap">
      Your Active Position
    </span>

    <div className="flex items-center gap-2">
      <span
        className="bg-[#0A2D4D] border border-white text-white px-2 py-0.5 rounded-full text-xs cursor-pointer transition-colors duration-200 hover:bg-[#123a63] hover:border-[#8B3EFE]"
      >
        {opposeMode ? "Oppose" : "Support"}
      </span>

<span className="text-lg whitespace-nowrap">
  {displayedShares > 0n
    ? `${formatTrust(displayedShares)} TRUST`
    : "No active position"}
</span>
    </div>

  </div>
</div>

{/* Wallet + Curve Row */}
<div className="flex justify-center">
  <div className="flex items-center gap-6 mb-3 w-[380px]"> {/* fixed width matching tabs/card */}

{/* LEFT: Wallet */}
<div className="flex flex-col">
  <div className="bg-[#110A2B] border border-[#393B60] rounded-2xl px-3 py-1.5 flex items-center gap-2 text-xs">
    <img src="/wallet.png" alt="Wallet Icon" className="w-4 h-4" />
    <span className="text-white">
      {Number(tTrustBalance) / 10 ** 18 >= 0
        ? (Number(tTrustBalance) / 10 ** 18).toFixed(2)
        : "0.00"} TRUST
    </span>
  </div>

  {/* Insufficient Funds Warning */}
  {transactionAmount &&
   Number(transactionAmount) > Number(tTrustBalance) / 10 ** 18 && (
    <span className="text-red-500 text-xs mt-1">
      Insufficient funds
    </span>
  )}
</div>

    {/* Right-aligned Cluster: Curve Info + Toggle + Info */}
<div className="flex items-center gap-1 ml-auto"> {/* ml-auto pushes the whole cluster to far right, gap-1 keeps them tight */}
  
  {/* Curve Info Text */}
  <div className="flex flex-col justify-center text-right"> {/* text-right aligns text toward toggle */}
    <span className="text-white text-xs">
      {isToggled ? "Exponential Curve" : "Linear Curve"}
    </span>
    <span className="text-[0.6rem] text-gray-300">
      {isToggled ? "High Risk, High Reward" : "Low Risk, Low Reward"}
    </span>
  </div>

  {/* Toggle */}
  <label className="relative inline-block w-10 h-5 cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={isToggled}
      onChange={() => setIsToggled(!isToggled)}
    />
    <span className="block w-full h-full bg-white rounded-full peer-checked:bg-white transition-colors"></span>
    <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-black rounded-full shadow-md peer-checked:translate-x-[1.25rem] transition-transform"></span>
  </label>

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
</div>

{/* Center Big Zero */}
<div className="flex flex-col items-center mt-2">
  <input
    type="number"
    min="0"
    placeholder="0"
    value={transactionAmount || ""} // blank if empty
    onChange={(e) => setTransactionAmount(e.target.value)}
    autoFocus
    className="bg-transparent text-white text-6xl text-center outline-none w-48 h-20
               appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  />
  <span className="text-gray-300 text-xs font-normal mt-1">TRUST</span>

  {/* Min Button */}
  <button
    type="button"
    onClick={() => setTransactionAmount("0.01")}
    className="mt-4 px-2 py-1 text-xs text-white bg-[#0A2D4D] rounded-full border border-white hover:bg-[#123a63] hover:border-[#8B3EFE] transition-colors"
  >
    Min
  </button>
</div>


{/* Review Deposit Button */}
<button
  className={`mx-auto block px-6 py-2.5 rounded-3xl mt-4 text-sm transition-colors ${
    transactionAmount &&
    Number(transactionAmount) > 0 &&
    Number(transactionAmount) <= Number(tTrustBalance) / 10 ** 18
      ? "bg-white text-black hover:bg-gray-200"
      : "bg-gray-700 text-gray-400 cursor-not-allowed"
  }`}
  onClick={() => setShowReviewDepositModal(true)}
  disabled={
    !transactionAmount ||
    Number(transactionAmount) <= 0 ||
    Number(transactionAmount) > Number(tTrustBalance) / 10 ** 18
  }
>
  {transactionAmount &&
  Number(transactionAmount) > Number(tTrustBalance) / 10 ** 18
    ? "Check Your Balance"
    : transactionAmount && Number(transactionAmount) > 0
    ? "Review Deposit"
    : "Enter an Amount"}
</button>

{/* Optional small red warning below button */}
{transactionAmount &&
 Number(transactionAmount) > Number(tTrustBalance) / 10 ** 18 && (
  <span className="text-red-500 text-xs mt-1 block text-center">
    Insufficient balance
  </span>
)}
  </div>
)}


{/* Tab Content */}
{activeTab === "redeem" && (
  <div className="px-4 md:px-12">
{/* Main Card: Active Position */}
<div className="flex justify-center mb-4">
  <div className="bg-[#110A2B] border-2 border-[#393B60] p-2 rounded-lg flex items-center justify-between gap-6 font-geist mt-4 w-[380px]">
    
    <span className="text-gray-300 text-xs whitespace-nowrap">
      Your Active Position
    </span>

    <div className="flex items-center gap-2">
      <span
        className="bg-[#0A2D4D] border border-white text-[7px] px-2 py-0.5 rounded-full text-xs cursor-pointer transition-colors duration-200 hover:bg-[#123a63] hover:border-[#8B3EFE]"
      >
        {opposeMode ? "Oppose" : "Support"}
      </span>

  {/* Active Curve Amount */}
  <span className="text-lg whitespace-nowrap">
  {displayedShares > 0n
    ? `${formatTrust(displayedShares)} TRUST`
    : "No active position"}
</span>
    </div>

  </div>
</div>

{/* Wallet + Curve Row */}
<div className="flex justify-center">
  <div className="flex items-center gap-6 mb-3 w-[380px]"> {/* fixed width matching tabs/card */}

{/* LEFT: Wallet */}
<div className="flex flex-col">
  <div className="bg-[#110A2B] border border-[#393B60] rounded-2xl px-3 py-1.5 flex items-center gap-2 text-xs">
    <img src="/wallet.png" alt="Wallet Icon" className="w-4 h-4" />
    <span className="text-white">
      {Number(tTrustBalance) / 10 ** 18 >= 0
        ? (Number(tTrustBalance) / 10 ** 18).toFixed(2)
        : "0.00"} TRUST
    </span>
  </div>

  {/* Insufficient Funds Warning */}
  {transactionAmount &&
  Number(transactionAmount) > maxRedeemable && (
    <span className="text-red-500 text-xs mt-1">
      Insufficient funds
    </span>
  )}
</div>

    {/* Right-aligned Cluster: Curve Info + Toggle + Info */}
<div className="flex items-center gap-1 ml-auto"> {/* ml-auto pushes the whole cluster to far right, gap-1 keeps them tight */}
  
  {/* Curve Info Text */}
  <div className="flex flex-col justify-center text-right"> {/* text-right aligns text toward toggle */}
    <span className="text-white text-xs">
      {isToggled ? "Exponential Curve" : "Linear Curve"}
    </span>
    <span className="text-[0.6rem] text-gray-300">
      {isToggled ? "High Risk, High Reward" : "Low Risk, Low Reward"}
    </span>
  </div>

  {/* Toggle */}
  <label className="relative inline-block w-10 h-5 cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={isToggled}
      onChange={() => setIsToggled(!isToggled)}
    />
    <span className="block w-full h-full bg-white rounded-full peer-checked:bg-white transition-colors"></span>
    <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-black rounded-full shadow-md peer-checked:translate-x-[1.25rem] transition-transform"></span>
  </label>

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
</div>

{/* Center Big Zero */}
<div className="flex flex-col items-center mt-2">
  <input
    type="number"
    min="0"
    placeholder="0"
    value={transactionAmount || ""} // blank if empty
    onChange={(e) => setTransactionAmount(e.target.value)}
    autoFocus
    className="bg-transparent text-white text-6xl text-center outline-none w-48 h-20
               appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  />
  <span className="text-gray-300 text-xs font-normal mt-1">TRUST</span>

  {/* Min Button */}
  <button
    type="button"
    onClick={() => setTransactionAmount("0.01")}
    className="mt-4 px-2 py-1 text-xs text-white bg-[#0A2D4D] rounded-full border border-white hover:bg-[#123a63] hover:border-[#8B3EFE] transition-colors"
  >
    Min
  </button>
</div>


    {/* Review Deposit Button */}
<button
  className={`mx-auto block px-6 py-2.5 rounded-3xl mt-4 text-sm transition-colors ${
    transactionAmount &&
    Number(transactionAmount) > 0 &&
    Number(transactionAmount) <= Number(tTrustBalance) / 10 ** 18
      ? "bg-white text-black hover:bg-gray-200"
      : "bg-gray-700 text-gray-400 cursor-not-allowed"
  }`}
  onClick={() => setShowReviewDepositModal(true)}
  disabled={
    !transactionAmount ||
    Number(transactionAmount) <= 0 ||
    Number(transactionAmount) > maxRedeemable
  }
>
{transactionAmount
  ? Number(transactionAmount) > maxRedeemable
    ? "Check Your Position"
    : "Review Redeem"
  : "Enter an Amount"}

</button>

{/* Optional small red warning below button */}
{transactionAmount &&
 Number(transactionAmount) > maxRedeemable && (
  <span className="text-red-500 text-xs mt-1 block text-center">
    "You only have {maxRedeemable} shares"
  </span>
)}
  </div>
)}
      {/* Close Button */}
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
        onClick={handleCloseModal}
      >
        ×
      </button>
    </div>
  </div>
)}

{showReviewDepositModal && activeClaim && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-[#070315] w-full max-w-md mx-4 p-3 rounded-xl relative border-2 border-[#8B3EFE]">

{/* Back Button */}
<button
  className="absolute -top-1 pb-2 left-2 text-white font-extrabold text-2xl px-2 py-1 rounded hover:bg-gray-700/50 transition-colors"
  onClick={() => {
    setShowReviewDepositModal(false);
    setModalStep("review");
  }}
>
  ←
</button>

      {/* Title + Support Tag */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-white font-bold text-base mt-2">Stake</h2>
<span
  className="bg-[#0A2D4D] text-white border border-white text-xs font-semibold px-2 py-0.5 mt-2 rounded-full cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#0A2D4D] hover:border-[#0A2D4D]"
>
  {opposeMode ? "Oppose" : "Support"}
</span>
      </div>

      <p className="text-gray-400 text-sm mb-6">
        Staking on a Triple enhances its discoverability in the Intuition system
      </p>

      {/* REVIEW */}
      {modalStep === "review" && (
        <>
          <div className="flex flex-col items-center my-6">
            <img src="/spinner.png" alt="Spinner" className="w-16 h-16 mb-2" />
            <span className="text-white font-semibold">Review...</span>
          </div>

          <div className="bg-[#110A2B] border-2 border-[#393B60] rounded-3xl flex justify-between items-center px-4 py-2 mb-3 mx-4">
            <span className="text-gray-300 text-sm font-semibold">Total Cost</span>
            <span className="text-white font-bold">
              {transactionAmount ? Number(transactionAmount).toFixed(2) : "0.00"}
            </span>
          </div>

<button
  className="mx-auto block bg-white text-black px-6 py-1.5 rounded-3xl font-semibold text-sm"
  onClick={() => {
    handleClaimAction("deposit");
    setShowModal(false);
  }}
>
  Confirm
</button>
        </>
      )}

      {/* AWAITING */}
      {modalStep === "awaiting" && (
        <>
          <div className="flex flex-col items-center my-6">
            <img src="/spinner.png" alt="Spinner" className="w-16 h-16 mb-2" />
            <span className="text-white font-semibold">Awaiting...</span>
          </div>

          <div className="flex items-center justify-center gap-2 bg-[#110A2B] border border-[#393B60] rounded-2xl px-4 py-2 mx-4">
            <img src="/wallet.png" alt="Wallet Icon" className="w-5 h-5" />
            <span className="text-white font-semibold text-sm">
              Awaiting wallet approval
            </span>
            <div className="relative group">
              <span className="text-gray-400 font-bold cursor-pointer text-sm">
                ?
              </span>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Approve this transaction in your wallet
              </div>
            </div>
          </div>
        </>
      )}

      {/* SUCCESS */}
      {modalStep === "success" && (
        <div className="flex flex-col items-center my-8">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>

          <span className="text-white font-semibold mb-6">
            Successfully {opposeMode ? "opposed" : "supported"}!
          </span>

          <button
            className="bg-white text-black px-6 py-2 rounded-3xl font-semibold text-sm"
            onClick={() => {
              setShowReviewDepositModal(false);
              setModalStep("review");
            }}
          >
            Done
          </button>
        </div>
      )}

      {/* FAILED */}
      {modalStep === "failed" && (
        <div className="flex flex-col items-center my-8">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">✕</span>
          </div>

          <span className="text-white font-semibold mb-6">
            Transaction Failed
          </span>

          <button
            className="bg-white text-black px-6 py-2 rounded-3xl font-semibold text-sm"
            onClick={() => setModalStep("review")}
          >
            Try Again
          </button>
        </div>
      )}

    </div>
  </div>
)}

{showReviewRedeemModal && activeClaim && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-[#070315] w-full max-w-md mx-4 p-3 rounded-xl relative border-2 border-[#8B3EFE]">

      {/* Close Button */}
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold"
        onClick={() => setShowReviewRedeemModal(false)}
      >
        ×
      </button>

      {/* Title + Support Tag */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-white font-bold text-base">Stake</h2>
        <span className="bg-[#0A2D4D] border border-white text-white px-3 py-1 rounded-full text-sm font-semibold">
          Support
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-gray-400 text-sm mb-6">
        Staking on a Triple enhances its discoverability in the Intuition system
      </p>

      {/* Centered Spinner + Label */}
      <div className="flex flex-col items-center my-6">
        <img src="/spinner.png" alt="Spinner" className="w-16 h-16 mb-2 animate-spin" />
        <span className="text-white font-semibold">Review...</span>
      </div>

{/* Total Cost */}
<div className="bg-[#110A2B] border-2 border-[#393B60] rounded-3xl flex justify-between items-center px-4 py-2 mb-3 mx-4">
            <span className="text-gray-300 text-sm font-semibold">Total Cost</span>
            <span className="text-white font-bold">
              {transactionAmount ? Number(transactionAmount).toFixed(2) : "0.00"}
            </span>
          </div>

      {/* Redeem TRUST Label */}
      <span className="text-gray-300 font-semibold mb-2 block">Redeem TRUST from Claim</span>

{/* Statement */}
<div className="text-gray-300 mb-6 px-6 flex flex-wrap items-center gap-2">
  <span className="font-bold bg-[#0b0618] hover:bg-[#140a25] transition-colors duration-200 px-2 py-1 rounded inline-flex items-center gap-2 max-w-[150px] truncate">
    <img src={activeClaim.term.triple.subject.image} alt="Claim Icon" className="w-5 h-5 object-contain" />
    {activeClaim.term.triple.subject.label}
  </span>

  <span>{activeClaim.term.triple.predicate.label}</span>

  <span className="bg-[#0b0618] hover:bg-[#140a25] transition-colors duration-200 px-2 py-1 rounded max-w-[150px] truncate">
    {activeClaim.term.triple.object.label}
  </span>
</div>

      {/* Amount Input */}
<div className="mb-4">
  <label className="text-gray-300 text-sm mb-1 block">Amount (in TRUST)</label>
  <input
    type="text"
    value={transactionAmount}
    onChange={(e) => setTransactionAmount(e.target.value)}
    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
{/* Redeem / Deposit Button */}
<button
  className="w-full bg-white text-black py-2.5 rounded-3xl font-semibold text-sm"
  onClick={() => handleClaimAction("redeem")}
>
  Redeem
</button>
    </div>
  </div>
)}
          {loading && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}

          <div ref={observerRef} className="h-10"></div>
        </div>
      </div>
    </div>
  );
}