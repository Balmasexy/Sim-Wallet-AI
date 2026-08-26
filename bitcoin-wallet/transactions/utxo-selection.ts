export interface SpendableUtxo {
  txid: string;
  vout: number;
  valueSats: bigint;
  confirmed: boolean;
}

export interface UtxoSelection {
  selected: SpendableUtxo[];
  selectedSats: bigint;
  targetSats: bigint;
  changeSats: bigint;
}

export function selectUtxos(
  utxos: SpendableUtxo[],
  targetSats: bigint
): UtxoSelection {
  if (targetSats <= 0n) {
    throw new Error("Target amount must be greater than zero");
  }

  const confirmed = utxos
    .filter((utxo) => utxo.confirmed)
    .sort((a, b) =>
      a.valueSats < b.valueSats ? -1 : 1
    );

  const selected: SpendableUtxo[] = [];
  let selectedSats = 0n;

  for (const utxo of confirmed) {
    selected.push(utxo);
    selectedSats += utxo.valueSats;

    if (selectedSats >= targetSats) {
      break;
    }
  }

  if (selectedSats < targetSats) {
    throw new Error("Insufficient confirmed Bitcoin balance");
  }

  return {
    selected,
    selectedSats,
    targetSats,
    changeSats: selectedSats - targetSats,
  };
}
