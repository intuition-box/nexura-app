import { useState, useEffect, useRef, useMemo } from "react";
import { Address, formatEther } from "viem";
import { buyShares, sellShares } from "../services/web3";
import { apiRequestV2 } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { formatNumber } from "../lib/utils";
import { useLocation } from "wouter";
import { getPublicClient } from "../lib/viem";
import { useAuth } from "../lib/auth";
import { network } from "../lib/constants";
import { Term, Position } from "../types/types";
import XPRewardPopup from "../components/XPRewardPopup"

const explorer = network === "testnet" ? "https://testnet.explorer.intuition.systems" : "https://explorer.intuition.systems";

interface Claim {
  user: { address: Address };
  term_id: Address;
  counter_term_id: Address;
  createdAt?: string;
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
  const [showPopup, setShowPopup] = useState(false);
  const [view, setView] = useState("list");
  const [sortOption, setSortOption] = useState('{"total_market_cap":"desc"}');
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Claim[]>([]);
  // const isSearching = searchTerm.trim().length >= 2;
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
  const [transactionLink, setTransactionLink] = useState("");
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
  const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
    setShowPopup(true);
  }, []);


  const [userSharesByCurve, setUserSharesByCurve] = useState<{
    support: { linear: bigint; exponential: bigint };
    oppose: { linear: bigint; exponential: bigint };
  }>({
    support: { linear: 0n, exponential: 0n },
    oppose: { linear: 0n, exponential: 0n },
  });
  const [supportShares, setSupportShares] = useState<{ linear: bigint; exponential: bigint }>({ linear: 0n, exponential: 0n });
  const [opposeShares, setOpposeShares] = useState<{ linear: bigint; exponential: bigint }>({ linear: 0n, exponential: 0n });


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
  let cancelled = false;

  const run = async () => {
    if (searchTerm.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    try {
      const res = await apiRequestV2(
        "POST",
        `/api/search-for-claim`,
        { keyword: searchTerm }
      );

      if (!cancelled) {
        setSearchResults(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      if (!cancelled) {
        console.error("Search failed:", err);
        setSearchResults([]);
      }
    } finally {
      if (!cancelled) {
        setSearchLoading(false);
      }
    }
  };

  const t = setTimeout(run, 500);

  return () => {
    cancelled = true;
    clearTimeout(t);
  };
}, [searchTerm]);

const highlightMatch = (text: string, term: string) => {
  if (!term) return text;

  // escape special regex characters
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(`(${escaped})`, "gi");

  return text.split(regex).map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <span key={i} className="bg-yellow-400 text-black px-0.5 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

  const { toast } = useToast();

const LIMIT = 50;
const isFetchingRef = useRef(false);
const offsetRef = useRef(0);

const isSearching = searchTerm.trim().length > 0;
const hasNoResults = isSearching && !searchLoading && searchResults.length === 0;
const requestLockRef = useRef(false);

const loadMore = async () => {
  if (requestLockRef.current || isSearching) return;
  if (!hasMore) return;

  requestLockRef.current = true;
  setLoading(true);

  try {
    const { claims } = await apiRequestV2(
      "GET",
      `/api/get-claims?filter=${sortOption}&offset=${offsetRef.current}`
    );

    if (!claims?.length) {
      setHasMore(false);
      return;
    }

    setVisibleClaims(prev => [...prev, ...claims]);

    offsetRef.current += claims.length;

    if (claims.length < LIMIT) setHasMore(false);

  } catch (err) {
    console.error(err);
  } finally {
    requestLockRef.current = false;
    setLoading(false);
  }
};

useEffect(() => {
  const source = isSearching ? searchResults : visibleClaims;
  setSortedClaims(sortClaims(source, sortOption));
}, [visibleClaims, searchResults, sortOption, isSearching]);

// Call whenever user changes
useEffect(() => {
  if (!user) return;

  if (isSearching) return;

  requestLockRef.current = true; 

  offsetRef.current = 0;
  setOffset(0);
  setVisibleClaims([]);
  setHasMore(true);

  // release lock after render settles
  setTimeout(() => {
    requestLockRef.current = false;
  }, 0);

}, [user, sortOption]);


const observerRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (isSearching) return;
  if (!hasMore) return;

  const el = observerRef.current;
  if (!el) return;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  });

  observer.observe(el);

  return () => observer.disconnect();
}, [hasMore, isSearching]);

  const formatTrust = (shares: bigint, decimals = 18, precision = 4) => {
    const divisor = 10n ** BigInt(decimals);
    const formatted = Number(shares) / Number(divisor);

    const factor = 10 ** precision;
    const truncated = Math.floor(formatted * factor) / factor;

    return truncated.toFixed(precision);
  };


  //// ------------------- Update Automatically.. active position--------
  const calculateUserShares = (claim: Claim, userAddress: string) => {
    let linear = 0n;
    let exponential = 0n;

    claim.term.vaults?.forEach((vault) => {
      const curveId = String(vault.curve_id).trim();

      (vault.userPosition ?? []).forEach((p) => {
        if (p?.account_id.toLowerCase() === userAddress.toLowerCase()) {
          const shares = BigInt(p.shares ?? 0);

          if (curveId === "1") linear += shares;
          if (curveId === "2") exponential += shares;
        }
      });
    });

    return { linear, exponential };
  };

  // ---------------- Handlers ----------------
  const handleSupportClick = (claim: Claim) => {
    if (!user) return;

    setActiveClaim(claim);
    setTermId(claim.term.id);
    setOpposeMode(false);
    setTransactionAmount("");

    const { linear, exponential } = calculateUserShares(claim, user.address);

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
        if (p?.account_id.toLowerCase() === user.address.toLowerCase()) {
          const shares = BigInt(p.shares ?? 0);
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
    if (!termId || !user?.address) return;

    try {
      setModalStep("awaiting");

      const addressTermId = termId as Address;

      let transactionHash: string = "";

      if (action === "deposit") {
        transactionHash = await buyShares({ buyAmount: transactionAmount, termId: addressTermId, curveId: isToggled ? 2n : 1n, isApproved: user.isApproved });
        if (parseFloat(transactionAmount) >= 200) {
          const { success } = await apiRequestV2("POST", "/api/user/claim-deposit-xp", { transactionHash });
          if (!success) {
            toast({ title: "Error", description: "Error rewarding user with xp" });
            return
          };
        }
      } else {
        transactionHash = await sellShares(transactionAmount, addressTermId, isToggled ? 2n : 1n);
      }

      await apiRequestV2("POST", "/api/user/update-claims", { transactionHash, action: action === "deposit" ? "buy" : "sell" });

      setTransactionLink(`${explorer}/tx/${transactionHash}`);

      // Refresh wallet balance after transaction
      const balance = await fetchWalletBalance(user.address);
      setTTrustBalance(balance);

      // ---------------- Recalculate shares after transaction ----------------
      if (activeClaim) {
        const { linear, exponential } = calculateUserShares(activeClaim, user.address);

        if (opposeMode) {
          setOpposeShares({ linear, exponential });
        } else {
          setSupportShares({ linear, exponential });
        }

        setActivePosition(isToggled ? exponential : linear);
      }
      // -----------------------------------------------------------------------

      const actionText = opposeMode ? "opposed" : "supported";

      toast({
        title: "Success",
        description: (
          <div className="flex items-center gap-2">
            <img src="/check.png" alt="success" className="w-4 h-4" />
            <span>Successfully {action === "deposit" ? "depoosited" : "redeemed"}</span>
          </div>
        ),
      });

      // setActionState(prev => ({
      //   ...prev,
      //   [termId]: opposeMode ? "opposed" : "supported"
      // }));

      setTransactionAmount("");
      setModalStep("success");

    } catch (err: any) {
      console.error(err);

      setModalStep("failed");

      toast({
        title: "Error",
        description: "Transaction failed",
        variant: "destructive",
      });
    }
  };

  // Sorting function
  const sortClaims = (claims: Claim[], option: string): Claim[] => {
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
            Number(b.total_position_count || 0) - Number(a.total_position_count || 0)
        );
      case "positions_asc":
        return sorted.sort(
          (a, b) =>
            Number(a.total_position_count || 0) - Number(b.total_position_count || 0)
        );
      case "createdAt_desc":
        return sorted.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
      case "createdAt_asc":
        return sorted.sort(
          (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
        );
      default:
        return claims;
    }
  };

  // Determine if the user has any active shares in the current direction
  const hasAnyPosition =
    (supportShares.linear + supportShares.exponential > 0n) ||
    (opposeShares.linear + opposeShares.exponential > 0n);
  // console.log("Has any position:", hasAnyPosition, supportShares, opposeShares);

  return (
    <div className="text-white font-geist font-light tracking-wide">
      {/* Header */}
      <h1 className="text-base">Claims</h1>

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
              <div className="hidden md:block overflow-x-auto w-full text-xs">
                <table className="min-w-full text-left border-collapse font-geist font-light tracking-wide">
                  <thead className="text-sm font-light tracking-wide">
                    <tr className="bg-gray-800 text-gray-300">
                      <th className="px-16 py-2 font-light tracking-wide">Claims</th>
                      <th className="px-4 py-2 font-light tracking-wide">Market Cap</th>
                      <th className="px-4 py-2 font-light tracking-wide">Support</th>
                      <th className="px-4 py-2 font-light tracking-wide">Oppose</th>
                      <th className="px-16 py-2 font-light tracking-wide">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-xs">
                    {sortedClaims.map((claim, index) => (
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
                            {/* Subject */}
                            <span
                              className="bg-[#22193A] px-2.5 py-1 rounded flex items-center gap-2 max-w-[240px] truncate cursor-pointer hover:bg-[#2f2350] transition-colors duration-200 text-sm sm:text-base"
                            >
                              <img
                                src={claim.term.triple.subject.image}
                                className="w-7 h-7 flex-shrink-0"
                              />
                              <span className="truncate">
                                {highlightMatch(claim.term.triple.subject.label, searchTerm)}
                              </span>
                            </span>

                            {/* Predicate */}
                            <span
                              className="text-xs px-1 cursor-pointer hover:text-white transition-colors duration-200"
                            >
                              {highlightMatch(claim?.term?.triple?.predicate?.label ?? "", searchTerm)}
                            </span>

                            {/* Object */}
                            <span
                              className="bg-[#22193A] px-2.5 py-1 rounded max-w-[280px] truncate cursor-pointer hover:bg-[#2f2350] transition-colors duration-200 text-sm sm:text-base"
                            >
                              {highlightMatch(claim.term.triple.object.label, searchTerm)}
                            </span>
                          </div>
                        </td>

                        {/* Market Cap */}
                        <td className="px-4 py-3">
                          {formatNumber(parseFloat(formatEther(BigInt(claim.total_market_cap))))} TRUST
                        </td>

                        {/* Support / Oppose Stats */}
                        <td className="px-4 py-3 text-blue-400">
                          <div className="flex items-center gap-2">
                            <img src="/user.png" className="w-4 h-4" />
                            {formatNumber(claim.term.positions_aggregate.aggregate.count, "user")}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#F19C03] ">
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
      className="px-4 py-2 rounded-lg text-xs bg-blue-600 text-white hover:brightness-110 transition-all"
      onClick={(e) => {
        e.stopPropagation();
        handleSupportClick(claim);
      }}
    >
      Support
    </button>

    {/* Oppose Button */}
    <button
      className="px-4 py-2 rounded-lg text-xs bg-[#F19C03] text-white hover:brightness-110 transition-all"
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

              {/* ================= MOBILE STACKED CARDS ================= */}
              <div className="md:hidden flex flex-col gap-3 px-1">
                {sortedClaims.map((claim, index) => {
                  const supportCount = claim.term.positions_aggregate.aggregate.count;
                  const opposeCount = claim.counter_term.positions_aggregate.aggregate.count;
                  const total = supportCount + opposeCount;
                  const supportPercent = total ? Math.round((supportCount / total) * 100) : 0;
                  const opposePercent = total ? 100 - supportPercent : 0;

                  return (
                    <div
                      key={index}
                      className="bg-[#060210] border border-gray-700 rounded-xl p-3 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer mx-auto w-full max-w-[95vw]"
                      onClick={() => setLocation(`/portal-claims/${claim.term_id}`)}
                    >
                      {/* Claim Statement */}
                      {/* Claim Statement */}
                      <div
                        className="mb-2 flex items-center gap-1 text-xs sm:text-sm w-full whitespace-nowrap overflow-hidden"
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Subject */}
                        <span
                          className="px-2 py-0.5 rounded truncate transition-colors duration-200"
                          style={{
                            flex: '0 0 20%',
                            minWidth: 0,
                            backgroundColor: '#1c122e', // slightly lighter than original
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2b1f45')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1c122e')}
                        >
                          {claim.term.triple.subject.label}
                        </span>

                        {/* Predicate */}
                        <span
                          className="truncate text-center"
                          style={{ flex: '0 0 10%', minWidth: 0 }}
                        >
                          {claim.term.triple.predicate.label}
                        </span>

                        {/* Object */}
                        <span
                          className="px-2 py-0.5 rounded truncate transition-colors duration-200"
                          style={{
                            flex: '0 0 20%',
                            minWidth: 0,
                            backgroundColor: '#1c122e', // match subject
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2b1f45')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1c122e')}
                        >
                          {claim.term.triple.object.label}
                        </span>
                      </div>

                      {/* Support / Oppose Stats */}
                      <div className="flex justify-between items-center text-xs sm:text-sm mb-3 w-full">
                        <div className="flex flex-col" style={{ flex: '0 0 45%' }}>
                          <span className="text-blue-400">Support: {supportCount}</span>
                          <span className="text-blue-400 text-[10px]">{supportPercent}%</span>
                        </div>
                        <div className="flex flex-col items-end" style={{ flex: '0 0 45%' }}>
                          <span className="text-[#F19C03]">Oppose: {opposeCount}</span>
                          <span className="text-[#F19C03] text-[10px]">{opposePercent}%</span>
                        </div>
                      </div>

                      {/* Action Buttons & Market Cap */}
                      <div className="flex justify-between items-center gap-2 w-full flex-wrap">
                        <div className="flex gap-2" style={{ flex: '0 0 45%' }}>
                          <button
                            onClick={() => handleSupportClick(claim)}
                            className="flex-1 h-10 sm:h-12 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-105 transition-transform"
                          >
                            Support
                          </button>
                          <button
                            onClick={() => handleOpposeClick(claim)}
                            className="flex-1 h-10 sm:h-12 bg-[#F19C03] text-white rounded-xl hover:bg-[#e59400] hover:scale-105 transition-transform"
                          >
                            Oppose
                          </button>
                        </div>
                        <div className="text-gray-400 text-xs sm:text-sm text-right" style={{ flex: '0 0 45%' }}>
                          {toFixed(formatEther(BigInt(claim.total_market_cap)))} TRUST
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                    className="bg-[#060210] border border-gray-700 rounded-xl p-3 hover:bg-[#2c0738] transition cursor-pointer"
                    onClick={() => setLocation(`/portal-claims/${claim.term_id}`)}
                  >
                    {/* Statement */}
                    <div className="text-gray-300 mb-2 flex flex-wrap items-center gap-1 text-sm">
                      <span className="bg-[#0b0618] px-2 py-0.5 rounded max-w-[40%] truncate text-xs">
                        {claim.term.triple.subject.label}
                      </span>
                      <span className="text-xs">{claim.term.triple.predicate.label}</span>
                      <span className="bg-[#0b0618] px-2 py-0.5 rounded max-w-[40%] truncate text-xs">
                        {claim.term.triple.object.label}
                      </span>
                    </div>

                    {/* Stats Section */}
                    <div className="flex overflow-hidden rounded-md text-xs">
                      {/* Support */}
                      <div className="flex-1 flex flex-col p-1 gap-0.5">
                        <span className="text-blue-400">Support</span>
                        <div className="flex items-center justify-between">
                          <span>{toFixed(formatEther(BigInt(claim.term.total_assets)))} TRUST</span>
                          <div className="flex items-center gap-1 text-blue-400">
                            <span>{formatNumber(claim.term.positions_aggregate.aggregate.count)}</span>
                            <img src="/user.png" alt="User Icon" className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Vertical Separator */}
                      <div className="w-px bg-white"></div>

                      {/* Oppose */}
                      <div className="flex-1 flex flex-col p-1 gap-0.5">
                        <span className="text-[#F19C03]">Oppose</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[#F19C03]">{toFixed(formatEther(BigInt(claim.counter_term.total_assets)))} TRUST</span>
                          <div className="flex items-center gap-1 text-[#F19C03]">
                            <span>{formatNumber(claim.counter_term.positions_aggregate.aggregate.count)}</span>
                            <img
                              src="/user-red.png"
                              alt="User Icon"
                              className="w-3 h-3"
                              style={{ filter: "invert(51%) sepia(90%) saturate(4515%) hue-rotate(2deg) brightness(97%) contrast(96%)" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Percent Bar */}
                    <div className="w-full h-3 bg-gray-700 rounded-lg overflow-hidden mt-1 relative">
                      <div className="flex h-full text-white text-xs">
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
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700 text-xs">
                      <div className="flex justify-center gap-2">
                        <button
                          className="bg-blue-600 px-3 py-1 rounded-lg text-xs pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSupportClick(claim);
                          }}
                        >
                          Support
                        </button>
                        <button
                          className="bg-[#F19C03] px-3 py-1 rounded-lg text-xs pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpposeClick(claim);
                          }}
                        >
                          Oppose
                        </button>
                      </div>

                      <div className="flex flex-col items-end text-gray-300">
                        <span>Total Market Cap</span>
                        <span className="text-white text-sm">
                          {toFixed(formatEther(BigInt(claim.total_market_cap)))} TRUST
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
                  <div className="flex items-center gap-1 group relative">
                   <span
                            className="bg-[#0A2D4D] text-white text-[9px] px-1 py-[1px] rounded-full cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#0A2D4D] hover:border-[#0A2D4D]"
                          >
                            {opposeMode ? "Oppose" : "Support"}
                          </span>

                    <span className="text-[10px] bg-gray-300 text-black rounded-full w-3 h-3 flex items-center justify-center cursor-default">
                      ?
                    </span>

                    {/* Tooltip */}
                    <div className="absolute left-0 top-5 w-56 text-[10px] bg-black text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Staking on a Triple signifies a belief in the relevancy of the respective Triple and enhances its discoverability in the Intuition system.
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-gray-400 text-xs mb-12 -pt-2">
                  Staking on a Triple enhances its discoverability in the Intuition system
                </p>

                {/* Statement */}
                <div className="text-gray-300 mb-6 px-6 flex flex-wrap items-center justify-center gap-2 text-sm">
                  <span className="bg-[#1a1230] hover:bg-[#241744] cursor-pointer transition-colors duration-200 px-3 py-1.5 rounded inline-flex items-center gap-2 max-w-[200px] truncate">
                    <img
                      src={activeClaim.term.triple.subject.image}
                      alt="Claim Icon"
                      className="w-5 h-5 object-contain"
                    />
                    {activeClaim.term.triple.subject.label}
                  </span>

                  <span>{activeClaim.term.triple.predicate.label}</span>

                  <span className="bg-[#1a1230] hover:bg-[#241744] cursor-pointer transition-colors duration-200 px-3 py-1.5 rounded max-w-[200px] truncate">
                    {activeClaim.term.triple.object.label}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-5">
                  <div className="flex gap-12 relative">

                    {/* Deposit Tab */}
                    <button
                      className={`relative px-6 py-3 text-base font-medium ${activeTab === "deposit" ? "text-white" : "text-gray-400"
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
                      className={`relative px-6 py-3 text-base font-medium transition-colors duration-200
    ${hasAnyPosition
                          ? activeTab === "redeem"
                            ? "text-white"
                            : "text-gray-400 hover:text-white cursor-pointer"
                          : "text-gray-600 cursor-not-allowed pointer-events-none"
                        }`}
                      onClick={() => hasAnyPosition && setActiveTab("redeem")}
                    >
                      Redeem
                      {hasAnyPosition && activeTab === "redeem" && (
                        <span
                          className="absolute left-1/2 bottom-0 w-48 h-0.5 transform -translate-x-1/2 bg-blue-500 rounded-full"
                        ></span>
                      )}
                    </button>

                  </div>
                </div>


                {/* Tab Content */}
                {activeTab === "deposit" && (
                  <div className="px-4 md:px-12">
                    {/* Main Card: Active Position */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-[#110A2B] border-2 border-[#393B60] p-2 rounded-lg flex items-center justify-between gap-6 mt-4 w-[380px]">

                        <span className="text-gray-300 text-xs whitespace-nowrap">
                          Your Active Position
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className="bg-[#0A2D4D] text-white text-[9px] px-1 py-[1px] rounded-full cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#0A2D4D] hover:border-[#0A2D4D]"
                          >
                            {opposeMode ? "Oppose" : "Support"}
                          </span>

                          <span className="text-xs whitespace-nowrap">
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

                            {/* Track */}
                            <span className="block w-full h-full bg-gray-400 peer-checked:bg-white rounded-full transition-colors duration-200"></span>

                            {/* Knob */}
                            <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-black rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-[1.25rem]"></span>
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
                    {/* <div className="flex flex-col items-center mt-2"> */}
                    <div className="flex flex-col items-center mt-2 w-full px-4">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={transactionAmount || ""}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                        autoFocus
                        className="bg-transparent text-white text-3xl text-center outline-none
               w-full max-w-[400px] h-12
               appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
               [&::-webkit-outer-spin-button]:appearance-none
               overflow-x-auto"
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
                      className={`mx-auto block px-6 py-2.5 rounded-3xl mt-4 text-sm transition-colors ${transactionAmount &&
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
                      <div className="bg-[#110A2B] border-2 border-[#393B60] p-2 rounded-lg flex items-center justify-between gap-6 mt-4 w-[380px]">

                        <span className="text-gray-300 text-xs whitespace-nowrap">
                          Your Active Position
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className="bg-[#0A2D4D] text-white text-[9px] px-1 py-[1px] rounded-full cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#0A2D4D] hover:border-[#0A2D4D]"
                          >
                            {opposeMode ? "Oppose" : "Support"}
                          </span>

                          {/* Active Curve Amount */}
                          <span className="text-xs whitespace-nowrap">
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

                            {/* Track */}
                            <span className="block w-full h-full bg-gray-400 peer-checked:bg-white rounded-full transition-colors duration-200"></span>

                            {/* Knob */}
                            <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-black rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-[1.25rem]"></span>
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
                    {/* <div className="flex flex-col items-center mt-2"> */}
                    <div className="flex flex-col items-center mt-2 w-full px-4">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={transactionAmount || ""}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                        autoFocus
                        className="bg-transparent text-white text-3xl text-center outline-none
               w-full max-w-[400px] h-12
               appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
               [&::-webkit-outer-spin-button]:appearance-none
               overflow-x-auto"
                      />
                      <span className="text-gray-300 text-xs font-normal mt-1">TRUST</span>

                      {/* Max Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const max = formatEther(displayedShares);
                          setTransactionAmount(max.toString());
                        }}
                        className="mt-4 px-2 py-1 text-xs text-white bg-[#0A2D4D] rounded-full border border-white hover:bg-[#123a63] hover:border-[#8B3EFE] transition-colors"
                      >
                        Max
                      </button>
                    </div>

                    {/* Review Deposit Button */}
                    <button
                      className={`mx-auto block px-5 py-1.5 rounded-3xl mt-4 text-sm transition-colors ${transactionAmount &&
                        Number(transactionAmount) > 0 &&
                        Number(transactionAmount) <= Number(tTrustBalance) / 10 ** 18
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      onClick={() => setShowReviewRedeemModal(true)}
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
                  className="absolute -top-1 pb-2 left-2 text-white text-2xl px-2 py-1 rounded hover:bg-gray-700/50 transition-colors"
                  onClick={() => {
                    setShowReviewDepositModal(false);
                    setModalStep("review");
                  }}
                >
                  ←
                </button>

                {/* Title + Support Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-white text-base mt-2">Stake</h2>
                  <span
                            className="bg-[#0A2D4D] text-white text-[9px] px-1 py-[1px] rounded-full cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#0A2D4D] hover:border-[#0A2D4D]"
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
                      <span className="text-white">Review...</span>
                    </div>

                    <button
                      className="mx-auto block bg-white text-black px-6 py-1.5 rounded-3xl text-sm"
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
                      <span className="text-white">Awaiting...</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 bg-[#110A2B] border border-[#393B60] rounded-2xl px-4 py-2 mx-4">
                      <img src="/wallet.png" alt="Wallet Icon" className="w-5 h-5" />
                      <span className="text-white text-sm">
                        Awaiting wallet approval
                      </span>
                      <div className="relative group">
                        <span className="text-gray-400 cursor-pointer text-sm">
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
      <span className="text-white text-2xl">✓</span>
    </div>

    <span className="text-white mb-2">
      Successfully {opposeMode ? "opposed" : "supported"}!
    </span>

    {/* Explorer link */}
    <a
      href={transactionLink} // this is where you will add the explorer link stuff
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 flex items-center gap-1 mb-6 hover:underline"
    >
      View Transaction on Explorer
      {/*<img src="/share.png" alt="share icon" className="w-4 h-4" />*/}
    </a>

    <button
      className="bg-white text-black px-6 py-2 rounded-3xl text-sm"
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
                      <span className="text-white text-2xl">✕</span>
                    </div>

                    <span className="text-white mb-6">
                      Transaction Failed
                    </span>

                    <button
                      className="bg-white text-black px-6 py-2 rounded-3xl text-sm"
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
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                  onClick={() => setShowReviewRedeemModal(false)}
                >
                  ×
                </button>

                {/* Title + Support Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-white text-base">Stake</h2>
                  <span
                            className="bg-[#0A2D4D] text-white text-[9px] px-1 py-[1px] rounded-full cursor-pointer transition-colors duration-200 hover:bg-white hover:text-[#0A2D4D] hover:border-[#0A2D4D]"
                          >
                            {opposeMode ? "Oppose" : "Support"}
                          </span>
                </div>

                {/* Subtitle */}
                <p className="text-gray-400 text-sm mb-6">
                  Staking on a Triple enhances its discoverability in the Intuition system
                </p>

                {/* REVIEW */}
                {modalStep === "review" && (
                  <>
                    <div className="flex flex-col items-center my-6">
                      <img src="/spinner.png" alt="Spinner" className="w-16 h-16 mb-2" />
                      <span className="text-white">Review...</span>
                    </div>

                    <button
                      className="mx-auto block bg-white text-black px-6 py-1.5 rounded-3xl text-sm"
                      onClick={() => {
                        handleClaimAction("redeem");
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
                      <span className="text-white">Awaiting...</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 bg-[#110A2B] border border-[#393B60] rounded-2xl px-4 py-2 mx-4">
                      <img src="/wallet.png" alt="Wallet Icon" className="w-5 h-5" />
                      <span className="text-white text-sm">
                        Awaiting wallet approval
                      </span>
                      <div className="relative group">
                        <span className="text-gray-400 cursor-pointer text-sm">
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
                      <span className="text-white text-2xl">✓</span>
                    </div>

                    <span className="text-white mb-6">
                      Successfully redeemed shares!
                    </span>
                    
                    <a
                      href={transactionLink} // this is where you will add the explorer link stuff
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 flex items-center gap-1 mb-6 hover:underline"
                    >
                      View Transaction on Explorer
                      {/*<img src="/share.png" alt="share icon" className="w-4 h-4" />*/}
                    </a>

                    <button
                      className="bg-white text-black px-6 py-2 rounded-3xl text-sm"
                      onClick={() => {
                        setShowReviewRedeemModal(false);
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
                      <span className="text-white text-2xl">✕</span>
                    </div>

                    <span className="text-white mb-6">
                      Transaction Failed
                    </span>

                    <button
                      className="bg-white text-black px-6 py-2 rounded-3xl text-sm"
                      onClick={() => setModalStep("review")}
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {loading && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}

          {hasNoResults && (
  <div className="flex flex-col items-center justify-center mt-6 text-gray-500">
    <p className="text-sm">No claims found</p>
    <p className="text-xs opacity-70">Try a different keyword</p>
  </div>
)}

                  {searchLoading && (
  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 justify-center py-6">
    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
    Searching...
  </div>
)}


          <div ref={observerRef} className="h-10"></div>
          <XPRewardPopup forceShow={showPopup} onClose={() => setShowPopup(false)} />
        </div>
      </div>
    </div>
  );
}