export interface TransactionSize {
  inputs: number;
  outputs: number;
}

export function estimateVbytes(
  size: TransactionSize
): number {
  const base = 10;
  const inputVbytes = 68;
  const outputVbytes = 31;

  return (
    base +
    size.inputs * inputVbytes +
    size.outputs * outputVbytes
  );
}

export function calculateFee(
  size: TransactionSize,
  feeRateSatPerVbyte: bigint
): bigint {
  if (feeRateSatPerVbyte < 0n) {
    throw new Error("Fee rate cannot be negative");
  }

  const vbytes = BigInt(
    Math.ceil(estimateVbytes(size))
  );

  return vbytes * feeRateSatPerVbyte;
}
