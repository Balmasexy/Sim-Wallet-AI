import { broadcastTestnetTransaction } from "../../bitcoin-wallet/network/broadcast-testnet";

export default async function handler(
  request: {
    method?: string;
    body?: unknown;
  },
  response: {
    status: (code: number) => {
      json: (body: unknown) => void;
    };
  }
): Promise<void> {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = request.body;

  const txHex =
    typeof body === "object" &&
    body !== null &&
    "txHex" in body
      ? (body as { txHex?: unknown }).txHex
      : undefined;

  if (typeof txHex !== "string") {
    response.status(400).json({
      error: "txHex is required",
    });
    return;
  }

  try {
    const result =
      await broadcastTestnetTransaction(txHex);

    response.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown broadcast error";

    response.status(502).json({
      error: message,
    });
  }
}
