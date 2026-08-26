const TESTNET_BROADCAST_URL =
  "https://mempool.space/testnet/api/tx";

export interface BroadcastResult {
  txid: string;
  provider: string;
  network: "testnet";
}

function validateRawTransaction(
  txHex: string
): void {
  const hex = txHex.trim();

  if (!hex) {
    throw new Error(
      "Raw transaction is required"
    );
  }

  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(
      "Raw transaction must be hexadecimal"
    );
  }

  if (hex.length % 2 !== 0) {
    throw new Error(
      "Raw transaction hex has an invalid length"
    );
  }
}

export async function broadcastTestnetTransaction(
  txHex: string
): Promise<BroadcastResult> {
  validateRawTransaction(txHex);

  const response = await fetch(
    TESTNET_BROADCAST_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "text/plain",
      },
      body: txHex.trim(),
    }
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Bitcoin Testnet broadcast failed (${response.status}): ${body}`
    );
  }

  const txid = body.trim();

  if (!/^[0-9a-fA-F]{64}$/.test(txid)) {
    throw new Error(
      "Broadcast provider returned an invalid transaction ID"
    );
  }

  return {
    txid,
    provider: "mempool.space",
    network: "testnet",
  };
}
