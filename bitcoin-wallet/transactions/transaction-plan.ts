import { selectUtxos, type SpendableUtxo } from "./utxo-selection";
import { calculateFee, estimateVbytes } from "./fees";

export interface TransactionPlanRequest {
  utxos: SpendableUtxo[];
  recipient: string;
  amountSats: bigint;
  feeRateSatPerVbyte: bigint;
}

export interface TransactionPlan {
  recipient: string;
  amountSats: bigint;
  feeSats: bigint;
  selectedUtxos: SpendableUtxo[];
  selectedSats: bigint;
  changeSats: bigint;
  estimatedVbytes: number;
}

export function createTransactionPlan(
  request: TransactionPlanRequest
): TransactionPlan {
  if (!request.recipient.startsWith("tb1")) {
    throw new Error("Recipient must be a Bitcoin Testnet SegWit address");
  }

  if (request.amountSats <= 0n) {
    throw new Error("Transaction amount must be greater than zero");
  }

  if (request.feeRateSatPerVbyte <= 0n) {
    throw new Error("Fee rate must be greater than zero");
  }

  const initialVbytes = estimateVbytes({
    inputs: 1,
    outputs: 1,
  });

  const initialFee =
    BigInt(initialVbytes) * request.feeRateSatPerVbyte;

  const selection = selectUtxos(
    request.utxos,
    request.amountSats + initialFee
  );

  const outputCount = selection.changeSats > 0n ? 2 : 1;

  const estimatedVbytes = estimateVbytes({
    inputs: selection.selected.length,
    outputs: outputCount,
  });

  const feeSats = calculateFee(
    {
      inputs: selection.selected.length,
      outputs: outputCount,
    },
    request.feeRateSatPerVbyte
  );

  const finalTarget = request.amountSats + feeSats;

  if (selection.selectedSats < finalTarget) {
    throw new Error(
      "Selected UTXOs do not cover amount plus final fee"
    );
  }

  return {
    recipient: request.recipient,
    amountSats: request.amountSats,
    feeSats,
    selectedUtxos: selection.selected,
    selectedSats: selection.selectedSats,
    changeSats: selection.selectedSats - finalTarget,
    estimatedVbytes,
  };
}
