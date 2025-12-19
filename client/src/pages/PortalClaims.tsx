import { useEffect, useState, useCallback } from "react";
import { buyShares, sellShares } from "@/services/web3"; // your web3 functions

interface Claim {
  id: string;
  titleLeft: string;
  titleMiddle: string;
  titleRight: string;
  supportCount: number;
  supportAmount: string;
  againstCount: number;
  againstAmount: string;
}

const LIMIT = 9; // 3x3 grid per batch

export default function PortalClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5051/api/claims?limit=${LIMIT}&offset=${offset}`
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const data: Claim[] = await res.json();
      if (data.length < LIMIT) setHasMore(false);

      setClaims((prev) => [...prev, ...data]);
      setOffset((prev) => prev + LIMIT);
    } catch (err: any) {
      console.error("Failed to fetch claims:", err);
      setError(err.message || "Failed to fetch claims");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [offset, loading, hasMore]);

  // Infinite scroll
  useEffect(() => {
    fetchClaims();
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY + 200 >=
        document.documentElement.scrollHeight
      )
        fetchClaims();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchClaims]);

  const handleSupport = async (claimId: string) => {
    try {
      await buyShares("0.01", claimId); // example amount
      alert("Supported via Metamask!");
    } catch (err: any) {
      console.error(err);
      alert("Transaction failed or rejected");
    }
  };

  const handleOppose = async (claimId: string) => {
    try {
      await sellShares("0.01", claimId); // example amount
      alert("Opposed via Metamask!");
    } catch (err: any) {
      console.error(err);
      alert("Transaction failed or rejected");
    }
  };

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (claims.length === 0 && loading) return <p>Loading claims...</p>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {claims.map((c) => (
        <div
          key={c.id}
          style={{
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            padding: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {/* Triple Titles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 2fr",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                padding: "0.25rem 0.5rem",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "5px",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {c.titleLeft}
            </div>
            <div
              style={{
                textAlign: "center",
                fontWeight: 500,
                color: "#ccc",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {c.titleMiddle}
            </div>
            <div
              style={{
                padding: "0.25rem 0.5rem",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "5px",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {c.titleRight}
            </div>
          </div>

          {/* Support/Oppose Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem",
                borderRadius: "8px",
                backgroundColor: "rgba(0,255,0,0.1)",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                Support Count: {c.supportCount.toFixed(1)}
              </span>
              <span style={{ fontSize: "0.75rem" }}>
                Amount: {parseFloat(c.supportAmount).toFixed(1)} ETH
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem",
                borderRadius: "8px",
                backgroundColor: "rgba(255,0,0,0.1)",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                Oppose Count: {c.againstCount.toFixed(1)}
              </span>
              <span style={{ fontSize: "0.75rem" }}>
                Amount: {parseFloat(c.againstAmount).toFixed(1)} ETH
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            <button
              onClick={() => handleSupport(c.id)}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "9999px",
                backgroundColor: "#0f7",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Support
            </button>
            <button
              onClick={() => handleOppose(c.id)}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "9999px",
                backgroundColor: "#f07",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                color: "#fff",
              }}
            >
              Oppose
            </button>
          </div>
        </div>
      ))}

      {loading && <p style={{ gridColumn: "1/-1", textAlign: "center" }}>Loading more...</p>}
      {!hasMore && <p style={{ gridColumn: "1/-1", textAlign: "center" }}>No more claims</p>}
    </div>
  );
}
