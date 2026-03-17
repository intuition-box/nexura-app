import type { Address } from "viem";

type tripleDetails = {
  term_id: Address,
  wallet_id: string,
  label: string,
  image: string,
  cached_image: {
    url: string,
    safe: true
  },
}

// data: string,
// type: string,
// value: {
//   person: null,
//   thing: {
//     name: string,
//     image: string,
//     cached_image: {
//       url: string,
//       safe: true
//     },
//     url: string
//   },
//   organization: null,
//   account: null,
//   json_object: {
//     description: string
//   }
// };

export type Term = {
  id: Address;
  total_market_cap: string;
  total_assets: string;
  vaults: Array<{
    curve_id: string;
    current_share_price: string;
    market_cap: string;
    position_count: number;
    total_shares: string;
    userPosition: Position[];
    total_assets: string;
  }>;
  positions_aggregate: {
    aggregate: {
      count: number
    }
  }
  triple: {
    subject: tripleDetails,
    predicate: tripleDetails,
    object: tripleDetails,
    creator: {
      id: Address,
      label: string,
      image: string,
      cached_image: {
        url: string,
        safe: true
      }
    }
  },
  creator: {
    id: Address, // wallet address
    label: string, // ens or username
    image: string,
    cached_image: {
      url: string,
      safe: true
    }
  };
}

export type Position = {
  shares: string;
  curve_id: number;
  account_id: string;
  direction: string;
  created_at?: string;
  account: {
    id: Address;
    label: string;
    image: string;
  }
};
