// server/index.ts
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

const GRAPHQL_URL = "https://mainnet.intuition.sh/v1/graphql";

const fetchGraphQL = async (query: string, variables = {}) => {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as any;
  return json.data;
};

app.get("/api/claims", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // 1️⃣ Fetch all vaults (slice for pagination)
    const vaultQuery = `
      query {
        vaults(order_by: { total_assets: desc }) {
          term_id
          total_assets
          total_shares
        }
      }
    `;
    const vaultData = await fetchGraphQL(vaultQuery);
    const allVaults = vaultData?.vaults ?? [];

    // Slice for pagination
    const vaults = allVaults.slice(offset, offset + limit);

    // 2️⃣ Fetch corresponding atoms
    const ids = vaults.map((v: any) => v.term_id);
    const atomQuery = `
      query ($ids: [String!]!) {
        atoms(where: { term_id: { _in: $ids } }) {
          term_id
          label
          image
        }
      }
    `;
    const atomData = await fetchGraphQL(atomQuery, { ids });
    const atoms = atomData?.atoms ?? [];

    // 3️⃣ Merge vaults + metadata with human-readable numbers
    const claims = vaults.map((v: any) => {
      const meta = atoms.find(
        (a: any) => a.term_id.toLowerCase() === v.term_id.toLowerCase()
      );

      const supportCount = Number(v.total_shares) / 1e18;
      const supportAmount = Number(v.total_assets) / 1e18;

      return {
        id: v.term_id,
        link: `/explore/triple/${v.term_id}`,
        titleLeft: meta?.label ?? "Unknown",
        titleMiddle: "is",
        titleRight: "a concept",
        supportCount: parseFloat(supportCount.toFixed(1)), // rounded to 1 decimal
        supportAmount: `${supportAmount.toFixed(1)} ETH`,
        againstCount: 0.0, // still unknown
        againstAmount: "0.0 ETH",
      };
    });

    res.json(claims);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load claims" });
  }
});

app.listen(5051, () =>
  console.log("Backend running → http://localhost:5051")
);