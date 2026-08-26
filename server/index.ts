import { createServer } from "node:http";
import {
  broadcastTestnetTransaction,
} from "../bitcoin-wallet/network/broadcast-testnet";

const PORT = Number(
  process.env.PORT ?? 3000
);

function sendJson(
  response: import("node:http").ServerResponse,
  status: number,
  body: unknown
): void {
  response.writeHead(status, {
    "Content-Type": "application/json",
  });

  response.end(
    JSON.stringify(body)
  );
}

async function readBody(
  request: import("node:http").IncomingMessage
): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(
      Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk)
    );
  }

  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(
  async (request, response) => {
    try {
      if (
        request.method === "GET" &&
        request.url === "/health"
      ) {
        sendJson(response, 200, {
          ok: true,
          service: "sim-wallet-api",
          network: "testnet",
        });

        return;
      }

      if (
        request.method === "POST" &&
        request.url === "/api/testnet/broadcast"
      ) {
        const body =
          await readBody(request);

        let parsed: unknown;

        try {
          parsed = JSON.parse(body);
        } catch {
          sendJson(response, 400, {
            error: "Invalid JSON",
          });

          return;
        }

        if (
          typeof parsed !== "object" ||
          parsed === null ||
          !("txHex" in parsed) ||
          typeof parsed.txHex !== "string"
        ) {
          sendJson(response, 400, {
            error:
              "txHex is required",
          });

          return;
        }

        const result =
          await broadcastTestnetTransaction(
            parsed.txHex
          );

        sendJson(response, 200, result);

        return;
      }

      sendJson(response, 404, {
        error: "Not found",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown server error";

      sendJson(response, 502, {
        error: message,
      });
    }
  }
);

server.listen(PORT, () => {
  console.log(
    `SIM Wallet API listening on port ${PORT}`
  );
});
