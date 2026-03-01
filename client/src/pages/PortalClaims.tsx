import { useState, useEffect, useRef } from "react";
import { Address, formatEther } from "viem";
import { buyShares, sellShares } from "../services/web3";
import { apiRequestV2 } from "../lib/queryClient";
import type { Term } from "../types/types";
import { useToast } from "../hooks/use-toast";
import { formatNumber } from "../lib/utils";
import { useLocation } from "wouter";
import { getPublicClient } from "../lib/viem";
import { useAuth } from "../lib/auth";

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
    const [transactionAmount, setTransactionAmount] = useState("0");
      // Wallet & Blockchain
    const [tTrustBalance, setTTrustBalance] = useState<bigint>(0n);
    const [inputValue, setInputValue] = useState(0);
    const [sortedClaims, setSortedClaims] = useState(visibleClaims);
    const [showCurveInfo, setShowCurveInfo] = useState(false);
    const [activePosition, setActivePosition] = useState<bigint>(0n);

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

  const loadMore = async () => {
  if (loading || !hasMore) return;

  try {
    setLoading(true);

    const searchQuery = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";
    const { claims } = await apiRequestV2(
  "GET",
  `/api/get-claims?filter=${sortOption}&offset=${offset}${searchQuery}`
);

const filteredClaims = claims.filter((claim: Claim) =>
  claimMatchesSearch(claim, searchTerm)
);

if (filteredClaims.length < LIMIT) setHasMore(false);

setVisibleClaims((prev) => [...prev, ...filteredClaims]);
setOffset((prev) => prev + LIMIT);
  } catch (err: any) {
    console.error("Failed to fetch claims:", err);
    setHasMore(false);
  } finally {
    setLoading(false);
  }
};

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

  // ---------------- Handlers ----------------
const handleSupportClick = (claim: Claim) => {
  setActiveClaim(claim);
  setTermId(claim.term.id);
  setOpposeMode(false);
  
  // Get user's current active position for this claim
  const userPosition = claim.term.user_position?.amount ?? 0n; // replace with actual property
  setActivePosition(userPosition);

  setShowModal(true);
};

const handleOpposeClick = (claim: Claim) => {
  setActiveClaim(claim);
  setTermId(claim.counter_term.id);
  setTransactionMode("redeem");
  setActiveTab("deposit");
  setOpposeMode(true);

  const userPosition = claim.counter_term.user_position?.amount ?? 0n;
  setActivePosition(userPosition);

  setShowModal(true);
};

    const handleCloseModal = () => {
      setActiveClaim(null);
      setShowModal(false);
      setOpposeMode(false);
    };

  const handleClaimAction = async (action = "support") => {
  try {
    await buyShares("0.01", termId as Address, isToggled ? 1n : 0n); // example amount

    toast({
      title: "Success",
      description: `Successfully ${action ? "opposed" : "supported"} a claim!`
    });
  } catch (err: any) {
    console.error(err);
    toast({
      title: "Error",
      description: err?.message || String(err), // <-- convert Error object to string
      variant: "destructive"
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

  return (
    <div className="p-3 text-white">
      {/* Header */}
      <h1 className="text-base font-semibold">Claims</h1>

      <p className="text-gray-400 mt-2 max-w-3xl">
        Semantic statements, allowing anyone to claim anything about anything
      </p>

      {/* Controls Section */}
      <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">

        {/* Search */}
        <div className="flex-1 min-w-[280px]">
          <input
  type="text"
  placeholder="Search claims by subject, predicate, or object.."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
        </div>

        {/* Grid/List Toggle */}
        <div className="hidden md:flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 ${view === "list" ? "bg-gray-900" : ""}`}
          >
            <img src="/list.png" alt="List View" className="w-5 h-5" />
          </button>

          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 ${view === "grid" ? "bg-gray-900" : ""}`}
          >
            <img src="/grid.png" alt="Grid View" className="w-5 h-5" />
          </button>
        </div>

        {/* Market Cap Dropdown */}
        <div className="relative w-full sm:w-auto">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="appearance-none bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pr-10 focus:outline-none"
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
      <div className="mt-8 overflow-x-auto">
        <div className="mt-8">
          {view === "list" && (
            <>
              {/* ================= DESKTOP TABLE ================= */}
              <div className="hidden md:block overflow-x-auto w-full">
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

                  <tbody className="text-sm">
  {visibleClaims.map((claim, index) => (
    <tr
      key={index}
      className="bg-[#060210] hover:bg-[#1a0f2e] cursor-pointer"
    >
      {/* Claim cell: clickable to navigate */}
      <td
        className="px-4 py-3"
        onClick={() => setLocation(`/portal-claims/${claim.term_id}`)}
      >
        <div className="flex flex-wrap items-center gap-2">
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
      <td className="px-4 py-3 font-semibold">
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
      <td className="px-4 py-3 text-center">
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
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>

              {/* ================= MOBILE STACKED LIST ================= */}
              <div className="md:hidden flex flex-col gap-4">
                {visibleClaims.map((claim, index) => (
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
            {visibleClaims.map((claim) => {
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
                      <span className="font-bold text-lg text-white">
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
<div
  className="bg-[#070315] max-w-lg w-full mx-4 p-3 rounded-lg relative border max-h-[85vh] overflow-y-auto"
  style={{ borderColor: "#8B3EFE" }}
>

      {/* Title + Support Tag */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-white font-bold text-base">Claim</h2>
        <span
  className="bg-[#0A2D4D] border border-white text-white px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#123a63] hover:border-[#8B3EFE]"
>
  {opposeMode ? "Oppose" : "Support"}
</span>
      </div>

      {/* Subtitle */}
      <p className="text-gray-400 text-sm mb-3">
        Supporting or Opposing a triple enhances its discoverability in the intuition system
      </p>

{/* Statement */}
<div className="text-gray-300 mb-4 px-6 flex flex-wrap items-center gap-2">
  <span className="bg-[#0b0618] px-2 py-1 rounded flex items-center gap-1 max-w-[150px] truncate min-w-0">
    <img src={activeClaim.term.triple.subject.image} alt="Claim Icon" className="w-5 h-5 object-contain" />
    {activeClaim.term.triple.subject.label}
  </span>
  <span>{activeClaim.term.triple.predicate.label}</span>
  <span className="bg-[#0b0618] px-2 py-1 rounded truncate max-w-[40%] ml-2 min-w-0">{activeClaim.term.triple.object.label}</span>
</div>

{/* Tabs */}
<div className="flex justify-center mb-3">
  <div className="flex gap-6 relative">
    {/* Deposit Tab */}
    <button
      className={`relative px-3 py-1.5 text-sm font-semibold ${
        activeTab === "deposit" ? "text-white" : "text-gray-400"
      }`}
      onClick={() => setActiveTab("deposit")}
    >
      Deposit
      {activeTab === "deposit" && (
        <span className="absolute left-1/2 bottom-0 w-24 transform -translate-x-1/2 h-1 bg-blue-500 rounded-full"></span>
      )}
    </button>

    {/* Redeem Tab */}
    <button
      className={`relative px-3 py-1.5 text-sm font-semibold ${
        activePosition > 0
          ? activeTab === "redeem"
            ? "text-white"
            : "text-gray-400 hover:text-white cursor-pointer"
          : "text-gray-500 cursor-not-allowed pointer-events-none"
      }`}
      onClick={() => {
        if (activePosition > 0) setActiveTab("redeem");
      }}
    >
      Redeem
      {activeTab === "redeem" && activePosition > 0 && (
        <span className="absolute left-1/2 bottom-0 w-24 transform -translate-x-1/2 h-1 bg-blue-500 rounded-full"></span>
      )}
    </button>
  </div>
</div>


{/* Tab Content */}
{activeTab === "deposit" && (
  <div className="px-4 md:px-12">
    {/* Main Card: Active Position */}
    <div className="bg-[#110A2B] border-2 border-[#393B60] p-4 rounded-xl min-h-[120px] flex flex-col justify-between mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-300 text-sm font-semibold">Your Active Position</span>
                <span
  className="bg-[#0A2D4D] border border-white text-white px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#123a63] hover:border-[#8B3EFE]"
>
  {opposeMode ? "Oppose" : "Support"}
</span>
      </div>
        <p className="text-white font-bold text-xl">
    {activePosition ? toFixed(formatEther(activePosition)) : "0"} TRUST
  </p>
    </div>

{/* Wallet Div */}
<div className="mt-2 ml-auto bg-[#110A2B] border-2 border-[#393B60] rounded-3xl px-3 py-1.5 flex items-center gap-2 w-max mb-4 text-sm">
  <img src="/wallet.png" alt="Wallet Icon" className="w-4 h-4" />
  <span className="text-white font-semibold">
    {Number(tTrustBalance) / 10 ** 18 >= 0
      ? (Number(tTrustBalance) / 10 ** 18).toFixed(4)
      : "0.0000"} TRUST
  </span>
</div>

{/* Center Big Zero */}
<div className="flex flex-col items-center my-2">
  <input
    type="number"
    min="0"
    placeholder="0"
    value={transactionAmount}
    onChange={(e) => setTransactionAmount(e.target.value)}
    className="bg-transparent text-white font-bold text-6xl text-center outline-none w-40 
               appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  />
  <span className="text-gray-300 text-xs mt-1">TRUST</span>
</div>

<div className="flex items-start gap-3">

  {/* Curve Card */}
  <div className="bg-[#110A2B] border-2 border-[#393B60] p-3 rounded-xl flex flex-col gap-3 flex-1">
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <span className="text-white font-bold text-base">
          {isToggled ? "Exponential Curve" : "Linear Curve"}
        </span>
        <span className="text-gray-300 text-xs mt-0.5">
          {isToggled ? "High Risk, High Reward" : "Low Risk, Low Reward"}
        </span>
      </div>

      {/* Toggle Button */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isToggled}
          onChange={() => setIsToggled(!isToggled)}
        />
        <div className="w-10 h-5 bg-white rounded-full peer peer-checked:bg-[#FFF] transition-colors"></div>
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-black rounded-full shadow-md peer-checked:translate-x-5 transition-transform"></div>
      </label>
    </div>
  </div>

  {/* Info Icon (Outside Card) */}
  <button
    onClick={() => setShowCurveInfo(true)}
    className="w-8 h-8 mt-2 flex items-center justify-center rounded-full border border-[#393B60] text-gray-300 text-sm font-bold hover:bg-[#1a133d] hover:text-white transition-colors"
  >
    i
  </button>

  {/* Slide-in Modal */}
{/* Curve Info Modal */}
{showCurveInfo && (
  <div className="fixed top-0 right-0 h-full w-96 bg-[#110A2B] border-l-2 border-[#393B60] p-4 z-50 animate-slideIn overflow-y-auto">
    
    {/* Close Button */}
    <button
      onClick={() => setShowCurveInfo(false)}
      className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold"
    >
      ✕
    </button>

    {/* Main Heading */}
    <h2 className="text-white font-bold text-lg text-center mb-2">How Bonding Curves Work</h2>
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
      <h4 className="text-white font-semibold mb-1">Linear Curve (Safe)</h4>
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
      <h4 className="text-white font-semibold mb-1">Exponential Curve (Riskier)</h4>
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

{/* Review Deposit Button */}
<button
  className={`w-full py-2.5 rounded-3xl font-semibold mt-3 text-sm transition-colors ${
    transactionAmount && Number(transactionAmount) > 0
      ? "bg-white text-black hover:bg-gray-200"
      : "bg-gray-700 text-gray-400 cursor-not-allowed"
  }`}
  onClick={() => setShowReviewDepositModal(true)}
  disabled={!transactionAmount || Number(transactionAmount) <= 0}
>
  {transactionAmount && Number(transactionAmount) > 0 ? "Review Deposit" : "Enter an Amount"}
</button>
  </div>
)}


{activeTab === "redeem" && (
  <div className="px-4 md:px-12">
    {/* Main Card: Active Position */}
    <div className="bg-[#110A2B] border-2 border-[#393B60] p-4 rounded-xl min-h-[120px] flex flex-col justify-between mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-300 text-sm font-semibold">Your Active Position</span>
                        <span
  className="bg-[#0A2D4D] border border-white text-white px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#123a63] hover:border-[#8B3EFE]"
>
  {opposeMode ? "Oppose" : "Support"}
</span>
      </div>
        <p className="text-white font-bold text-xl">
    {activePosition ? toFixed(formatEther(activePosition)) : "0"} TRUST
  </p>
    </div>

{/* Wallet Div */}
<div className="mt-2 ml-auto bg-[#110A2B] border-2 border-[#393B60] rounded-3xl px-3 py-1.5 flex items-center gap-2 w-max mb-4 text-sm">
  <img src="/wallet.png" alt="Wallet Icon" className="w-4 h-4" />
  <span className="text-white font-semibold">
    {Number(tTrustBalance) / 10 ** 18 >= 0
      ? (Number(tTrustBalance) / 10 ** 18).toFixed(4)
      : "0.0000"} TRUST
  </span>
</div>

{/* Center Big Zero */}
<div className="flex flex-col items-center my-2">
  <input
    type="number"
    min="0"
    placeholder="0"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    className="bg-transparent text-white font-bold text-6xl text-center outline-none w-40 
               appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  />
  <span className="text-gray-300 text-xs mt-1">TRUST</span>
</div>

<div className="flex items-start gap-3">

  {/* Curve Card */}
  <div className="bg-[#110A2B] border-2 border-[#393B60] p-3 rounded-xl flex flex-col gap-3 flex-1">
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <span className="text-white font-bold text-base">
          {isToggled ? "Exponential Curve" : "Linear Curve"}
        </span>
        <span className="text-gray-300 text-xs mt-0.5">
          {isToggled ? "High Risk, High Reward" : "Low Risk, Low Reward"}
        </span>
      </div>

      {/* Toggle Button */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isToggled}
          onChange={() => setIsToggled(!isToggled)}
        />
        <div className="w-10 h-5 bg-white rounded-full peer peer-checked:bg-[#FFF] transition-colors"></div>
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-black rounded-full shadow-md peer-checked:translate-x-5 transition-transform"></div>
      </label>
    </div>
  </div>

  {/* Info Icon (Beside Card) */}
  <div className="flex flex-col items-center">
    <button
      onClick={() => setShowCurveInfo(true)}
      className="w-8 h-8 mt-2 flex items-center justify-center rounded-full border border-[#393B60] text-gray-300 text-sm font-bold hover:bg-[#1a133d] hover:text-white transition-colors"
    >
      i
    </button>

    {/* Slide-in Modal (Fixed Right) */}
    {showCurveInfo && (
      <div className="fixed top-0 right-0 h-full w-96 bg-[#110A2B] border-l-2 border-[#393B60] p-4 z-50 animate-slideIn overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setShowCurveInfo(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold"
        >
          ✕
        </button>

        {/* Main Heading */}
        <h2 className="text-white font-bold text-lg text-center mb-2">How Bonding Curves Work</h2>
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
          <h4 className="text-white font-semibold mb-1">Linear Curve (Safe)</h4>
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
          <h4 className="text-white font-semibold mb-1">Exponential Curve (Riskier)</h4>
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

    {/* Review Deposit Button */}
<button
  className="w-full bg-white text-black py-2.5 rounded-3xl font-semibold mt-3 text-sm"
  onClick={() => setShowReviewRedeemModal(true)}
>
  Review Redeem
</button>

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

      {/* Close Button */}
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold"
        onClick={() => setShowReviewDepositModal(false)}
      >
        ×
      </button>

      {/* Title + Support Tag */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-white font-bold text-base">Claim</h2>
        <span className="bg-[#0A2D4D] border border-white text-white px-3 py-1 rounded-full text-sm font-semibold">
          Deposit
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-gray-400 text-sm mb-6">
        Depositing into a triple increases its impact in the intuition system
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
    {transactionAmount ? Number(transactionAmount).toFixed(4) : "0.0000"}
  </span>
</div>

      {/* Deposit TRUST Label */}
      <span className="text-gray-300 font-semibold mb-2 block">Deposit TRUST into Claim</span>

      {/* Statement */}
      <div className="text-gray-300 mb-6 px-6 flex flex-wrap items-center gap-2">
        <span className="font-bold bg-[#0b0618] px-2 py-1 rounded inline-flex items-center gap-2 max-w-[150px] truncate">
          <img src={activeClaim.term.triple.subject.image} alt="Claim Icon" className="w-5 h-5 object-contain" />
          {activeClaim.term.triple.subject.label}
        </span>
        <span>{activeClaim.term.triple.predicate.label}</span>
        <span className="bg-[#0b0618] px-2 py-1 rounded max-w-[150px] truncate">{activeClaim.term.triple.object.label}</span>
      </div>

{/* Amount Input */}
<div className="mb-4">
  <label className="text-gray-300 text-sm mb-1 block">Amount (in TRUST)</label>
  <input
    type="text"
    value={transactionAmount}
    readOnly
    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white cursor-not-allowed"
  />
</div>

      {/* Deposit / Redeem Button */}
      <button
  className="w-full bg-white text-black py-2.5 rounded-3xl font-semibold text-sm"
  onClick={() => handleClaimAction("deposit")}
>
  Deposit
</button>
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
        <h2 className="text-white font-bold text-base">Claim</h2>
        <span className="bg-[#0A2D4D] border border-white text-white px-3 py-1 rounded-full text-sm font-semibold">
          Support
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-gray-400 text-sm mb-6">
        Supporting or Opposing a triple enhances its discoverability in the intuition system
      </p>

      {/* Centered Spinner + Label */}
      <div className="flex flex-col items-center my-6">
        <img src="/spinner.png" alt="Spinner" className="w-16 h-16 mb-2 animate-spin" />
        <span className="text-white font-semibold">Review...</span>
      </div>

{/* Total Cost */}
<div className="bg-[#110A2B] border-2 border-[#393B60] rounded-3xl flex justify-between items-center px-4 py-2 mb-3 mx-4">
  <span className="text-gray-300 text-sm font-semibold">Total Cost</span>
  <span className="text-white font-bold">0.0954</span>
</div>

      {/* Redeem TRUST Label */}
      <span className="text-gray-300 font-semibold mb-2 block">Redeem TRUST from Claim</span>

      {/* Statement */}
      <div className="text-gray-300 mb-6 px-6 flex flex-wrap items-center gap-2">
        <span className="font-bold bg-[#0b0618] px-2 py-1 rounded inline-flex items-center gap-2 max-w-[150px] truncate">
          <img src={activeClaim.term.triple.subject.image} alt="Claim Icon" className="w-5 h-5 object-contain" />
          {activeClaim.term.triple.subject.label}
        </span>
        <span>{activeClaim.term.triple.predicate.label}</span>
        <span className="bg-[#0b0618] px-2 py-1 rounded max-w-[150px] truncate">{activeClaim.term.triple.object.label}</span>
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
