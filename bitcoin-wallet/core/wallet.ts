export type BitcoinNetwork = "testnet" | "mainnet";

export interface WalletBalance {
  confirmedSats: bigint;
  pendingSats: bigint;
}

export interface BitcoinWallet {
  id: string;
  network: BitcoinNetwork;
  address: string;
  balance: WalletBalance;
  createdAt: string;
}

export function createWallet(
  network: BitcoinNetwork = "testnet"
): BitcoinWallet {
  return {
    id: crypto.randomUUID(),
    network,
    address: "",
    balance: {
      confirmedSats: 0n,
      pendingSats: 0n,
    },
    createdAt: new Date().toISOString(),
  };
}

export function formatBTC(satoshis: bigint): string {
  const whole = satoshis / 100_000_000n;
  const fraction = (satoshis % 100_000_000n)
    .toString()
    .padStart(8, "0");

  return `${whole}.${fraction} BTC`;
}

export function getAvailableBalance(
  balance: WalletBalance
): bigint {
  return balance.confirmedSats;
}
