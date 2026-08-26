export const BITCOIN_TESTNET = {
  name: "Bitcoin Testnet",
  network: "testnet" as const,
  explorer: "https://mempool.space/testnet",
};

export interface UTXO {
  txid: string;
  vout: number;
  valueSats: bigint;
  confirmed: boolean;
  confirmations: number;
}

export interface Balance {
  confirmedSats: bigint;
  pendingSats: bigint;
  availableSats: bigint;
}

export function calculateBalance(utxos: UTXO[]): Balance {
  let confirmedSats = 0n;
  let pendingSats = 0n;

  for (const utxo of utxos) {
    if (utxo.confirmed) {
      confirmedSats += utxo.valueSats;
    } else {
      pendingSats += utxo.valueSats;
    }
  }

  return {
    confirmedSats,
    pendingSats,
    availableSats: confirmedSats,
  };
}

export function satsToBTC(sats: bigint): string {
  const whole = sats / 100_000_000n;

  const fraction = (sats % 100_000_000n)
    .toString()
    .padStart(8, "0");

  return `${whole}.${fraction}`;
}
