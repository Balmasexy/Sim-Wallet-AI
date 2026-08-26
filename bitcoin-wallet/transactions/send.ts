export interface SendRequest {
  recipient: string;
  amountSats: bigint;
}

export interface FeeEstimate {
  feeSats: bigint;
  feeRateSatPerVbyte: bigint;
}

export function validateRecipient(
  recipient: string
): boolean {
  return /^tb1[a-z0-9]+$/i.test(recipient);
}

export function validateSendAmount(
  amountSats: bigint
): boolean {
  return amountSats > 0n;
}

export function calculateSendTotal(
  amountSats: bigint,
  feeSats: bigint
): bigint {
  if (amountSats <= 0n) {
    throw new Error("Send amount must be greater than zero");
  }

  if (feeSats < 0n) {
    throw new Error("Fee cannot be negative");
  }

  return amountSats + feeSats;
}

export function canSend(
  availableSats: bigint,
  amountSats: bigint,
  feeSats: bigint
): boolean {
  if (availableSats < 0n) return false;
  if (amountSats <= 0n) return false;
  if (feeSats < 0n) return false;

  return availableSats >= amountSats + feeSats;
}
