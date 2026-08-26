import type { UTXO } from "./bitcoin-testnet";

const API_BASE = "https://mempool.space/testnet/api";

export async function getAddressUtxos(
  address: string
): Promise<UTXO[]> {
  if (!address.startsWith("tb1")) {
    throw new Error("Expected a Bitcoin Testnet SegWit address");
  }

  const response = await fetch(
    `${API_BASE}/address/${encodeURIComponent(address)}/utxo`
  );

  if (!response.ok) {
    throw new Error(
      `Testnet API request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data.map((utxo: any) => ({
    txid: String(utxo.txid),
    vout: Number(utxo.vout),
    valueSats: BigInt(utxo.value),
    confirmed: Boolean(utxo.status?.confirmed),
    confirmations: Number(utxo.status?.block_height ?? 0),
  }));
}

export async function getAddressBalance(
  address: string
) {
  const utxos = await getAddressUtxos(address);

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
