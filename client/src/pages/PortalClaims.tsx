import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Claim {
  avatar: string;
  titleLeft: string;
  titleMiddle: string;
  titleRight: string;
  support: number;
  against: number;
}

export default function PortalClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<Record<number, "support" | "oppose" | null>>({});

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5051/api/claims");
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Expected array but got:", data);
          setClaims([]);
          return;
        }

        setClaims(
          data.map((c: any) => ({
            avatar: c.avatar || "",
            titleLeft: c.titleLeft || "",
            titleMiddle: c.titleMiddle || "",
            titleRight: c.titleRight || "",
            support: c.support ?? 0,
            against: c.against ?? 0,
          }))
        );
      } catch (err) {
        console.error(err);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const handleVote = (index: number, type: "support" | "oppose") => {
    setVotes(prev => ({ ...prev, [index]: type }));
    console.log(`User voted ${type} on claim ${index}`);
  };

  if (loading) return <div className="text-white p-6">Loading claims...</div>;
  if (!claims.length) return <div className="text-white p-6">No claims found</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-10">Portal Claims</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {claims.map((claim, index) => (
          <div
            key={index}
            className="group glass glass-hover rounded-3xl p-6 transition-all duration-300 relative overflow-hidden block"
          >
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-700 border-2 border-gray-600 transform rotate-45 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="w-14 h-14 transform -rotate-45 rounded-lg overflow-hidden">
                    <img
                      src={claim.avatar || "/placeholder-avatar.png"}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Titles */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-4 py-1.5 rounded-[20px] bg-[#0f1a22] text-white text-sm font-medium">
                {claim.titleLeft}
              </span>
              <span className="text-white/60 text-sm">{claim.titleMiddle}</span>
              <span className="px-4 py-1.5 rounded-[20px] bg-[#192732] text-white text-sm font-semibold">
                {claim.titleRight}
              </span>
            </div>

            {/* Support / Against numbers */}
            <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
              <span>{claim.support.toLocaleString()} support</span>
              <span>{claim.against.toLocaleString()} against</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-2">
              <Button
                variant={votes[index] === "support" ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote(index, "support")}
              >
                Support
              </Button>
              <Button
                variant={votes[index] === "oppose" ? "destructive" : "outline"}
                size="sm"
                onClick={() => handleVote(index, "oppose")}
              >
                Oppose
              </Button>
            </div>

            {votes[index] && (
              <div className="mt-2 text-sm text-green-400">
                You voted: {votes[index]?.toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
