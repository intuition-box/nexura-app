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
    const vaultQuery = `query GetExploreTriples($where: triple_term_bool_exp, $orderBy: [triple_term_order_by!], $limit: Int, $offset: Int, $userPositionAddress: String) {
      triple_terms(where: $where, order_by: $orderBy, limit: $limit, offset: $offset) {
        term_id
        counter_term_id
        total_assets
        total_market_cap
        total_position_count
        term {
          id
          total_market_cap
          total_assets
          vaults(order_by: {curve_id: asc}) {
            curve_id
            current_share_price
            total_shares
            total_assets
            position_count
            market_cap
            userPosition: positions(
            limit: 1
            where: {account_id: {_eq: $userPositionAddress}}
            ) {
              shares
              account_id
            }
          }
          positions_aggregate {
            aggregate {
              count
            }
          }
          triple {
            term_id
            counter_term_id
            created_at
            subject_id
            predicate_id
            object_id
            subject {
              term_id
              wallet_id
              label
              image
              cached_image {
                ...CachedImageFields
              }
              data
              type
              value {
                ...AtomValueLight
              }
            }
            predicate {
              term_id
              wallet_id
              label
              image
              cached_image {
                ...CachedImageFields
              }
              data
              type
              value {
                ...AtomValueLight
              }
            }
            object {
              term_id
              wallet_id
              label
              image
              cached_image {
                ...CachedImageFields
              }
              data
              type
              value {
                ...AtomValue
              }
            }
            creator {
              id
              label
              image
              cached_image {
                ...CachedImageFields
              }
            }
          }
        }
        counter_term {
          id
          total_market_cap
          total_assets
          vaults(order_by: {curve_id: asc}) {
            curve_id
            current_share_price
            total_shares
            total_assets
            position_count
            market_cap
            userPosition: positions(
            limit: 1
            where: {account_id: {_eq: $userPositionAddress}}
            ) {
              shares
              account_id
            }
          }
          positions_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    }

    fragment CachedImageFields on cached_images_cached_image {
      url
      safe
    }

    fragment AtomValueLight on atom_values {
      person {
        name
        image
        cached_image {
          ...CachedImageFields
        }
        url
      }
      thing {
        name
        image
        cached_image {
          ...CachedImageFields
        }
        url
      }
      organization {
        name
        image
        url
      }
      account {
        id
        label
        image
        cached_image {
          ...CachedImageFields
        }
      }
    }
    
    
    fragment AtomValue on atom_values {
      ...AtomValueLight
      json_object {
      description: data(path: \"description\")
      }
    }
    `;

    const vaultData = await fetchGraphQL(vaultQuery, { where: {}, orderBy: [{total_market_cap: "desc"}], limit, offset, userPositionAddress: "…" });
    // const allVaults = vaultData?.vaults ?? [];

    // // Slice for pagination
    // const vaults = allVaults.slice(offset, offset + limit);

    // // 2️⃣ Fetch corresponding atoms
    // const ids = vaults.map((v: any) => v.term_id);
    // const atomQuery = `
    //   query ($ids: [String!]!) {
    //     atoms(where: { term_id: { _in: $ids } }) {
    //       term_id
    //       label
    //       image
    //     }
    //   }
    // `;
    // const atomData = await fetchGraphQL(atomQuery, { ids });
    // const atoms = atomData?.atoms ?? [];

    // // 3️⃣ Merge vaults + metadata with human-readable numbers
    // const claims = vaults.map((v: any) => {
    //   const meta = atoms.find(
    //     (a: any) => a.term_id.toLowerCase() === v.term_id.toLowerCase()
    //   );

    //   const supportCount = Number(v.total_shares) / 1e18;
    //   const supportAmount = Number(v.total_assets) / 1e18;

    //   return {
    //     id: v.term_id,
    //     link: `/explore/triple/${v.term_id}`,
    //     titleLeft: meta?.label ?? "Unknown",
    //     titleMiddle: "is",
    //     titleRight: "a concept",
    //     supportCount: parseFloat(supportCount.toFixed(1)), // rounded to 1 decimal
    //     supportAmount: `${supportAmount.toFixed(1)} ETH`,
    //     againstCount: 0.0, // still unknown
    //     againstAmount: "0.0 ETH",
    //   };
    // });

    res.json({vaultData});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load claims" });
  }
});

app.listen(5051, () =>
  console.log("Backend running → http://localhost:5051")
);