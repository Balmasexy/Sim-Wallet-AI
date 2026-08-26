export interface ReceiveRequest {
  address: string;
  amountSats?: bigint;
  label?: string;
  message?: string;
}

function assertTestnetAddress(address: string): void {
  if (!address.startsWith("tb1")) {
    throw new Error(
      "SIM Wallet currently accepts Bitcoin Testnet addresses only."
    );
  }
}

export function createBitcoinPaymentUri(
  request: ReceiveRequest
): string {
  assertTestnetAddress(request.address);

  const params = new URLSearchParams();

  if (request.amountSats !== undefined) {
    const btc =
      Number(request.amountSats) / 100_000_000;

    params.set("amount", btc.toFixed(8));
  }

  if (request.label) {
    params.set("label", request.label);
  }

  if (request.message) {
    params.set("message", request.message);
  }

  const query = params.toString();

  return query
    ? `bitcoin:${request.address}?${query}`
    : `bitcoin:${request.address}`;
}

export function validateReceiveAddress(
  address: string
): boolean {
  return /^tb1[a-z0-9]+$/i.test(address);
}
