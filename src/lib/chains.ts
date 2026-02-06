export type ChainGlyph =
  | "eth"
  | "bnb"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "base"
  | "avalanche"
  | "fantom"
  | "zksync";

export type ChainVisualMeta = {
  name: string;
  abbr: string;
  gradient: string;
  glyph?: ChainGlyph;
};

const DEFAULT_CHAIN_META: ChainVisualMeta = {
  name: "Unknown Chain",
  abbr: "?",
  gradient: "linear-gradient(135deg, #2F185A, #12061F)",
};

const CHAIN_META: Record<number, ChainVisualMeta> = {
  1: {
    name: "Ethereum",
    abbr: "ETH",
    gradient: "linear-gradient(135deg, #627EEA, #3A60D7)",
    glyph: "eth",
  },
  10: {
    name: "Optimism",
    abbr: "OP",
    gradient: "linear-gradient(135deg, #FF0420, #C60017)",
    glyph: "optimism",
  },
  56: {
    name: "BNB Chain",
    abbr: "BNB",
    gradient: "linear-gradient(135deg, #F3BA2F, #C58800)",
    glyph: "bnb",
  },
  1101: {
    name: "Polygon zkEVM",
    abbr: "ZKEVM",
    gradient: "linear-gradient(135deg, #8247E5, #3C1F86)",
  },
  137: {
    name: "Polygon",
    abbr: "POLY",
    gradient: "linear-gradient(135deg, #8247E5, #5C23D6)",
    glyph: "polygon",
  },
  250: {
    name: "Fantom",
    abbr: "FTM",
    gradient: "linear-gradient(135deg, #1969FF, #0B3CA8)",
    glyph: "fantom",
  },
  324: {
    name: "zkSync",
    abbr: "ZK",
    gradient: "linear-gradient(135deg, #8C52FF, #45149B)",
    glyph: "zksync",
  },
  8453: {
    name: "Base",
    abbr: "BASE",
    gradient: "linear-gradient(135deg, #0052FF, #0031A8)",
    glyph: "base",
  },
  42161: {
    name: "Arbitrum",
    abbr: "ARB",
    gradient: "linear-gradient(135deg, #2D374B, #1A2636)",
    glyph: "arbitrum",
  },
  43114: {
    name: "Avalanche",
    abbr: "AVAX",
    gradient: "linear-gradient(135deg, #E84142, #BC1E2D)",
    glyph: "avalanche",
  },
  59144: {
    name: "Linea",
    abbr: "LINEA",
    gradient: "linear-gradient(135deg, #0B0B54, #050527)",
  },
} as const;

export const getChainVisualMeta = (networkId?: number | null): ChainVisualMeta & {
  networkId?: number | null;
} => {
  if (!networkId) {
    return DEFAULT_CHAIN_META;
  }

  const meta = CHAIN_META[networkId];
  if (meta) {
    return meta;
  }

  return {
    ...DEFAULT_CHAIN_META,
    name: `Chain ID ${networkId}`,
    abbr: `${networkId}`,
  };
};

export const getSupportedChains = () =>
  Object.entries(CHAIN_META).map(([id, meta]) => ({
    networkId: Number(id),
    ...meta,
  }));
