import QRCode from "qrcode";

export interface ReceiveQrOptions {
  address: string;
  amountSats?: bigint;
  label?: string;
  message?: string;
}

export async function createReceiveQr(
  options: ReceiveQrOptions
): Promise<string> {
  const params = new URLSearchParams();

  if (options.amountSats !== undefined) {
    const btc =
      Number(options.amountSats) / 100_000_000;

    params.set("amount", btc.toFixed(8));
  }

  if (options.label) {
    params.set("label", options.label);
  }

  if (options.message) {
    params.set("message", options.message);
  }

  const query = params.toString();

  const uri = query
    ? `bitcoin:${options.address}?${query}`
    : `bitcoin:${options.address}`;

  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });
}
