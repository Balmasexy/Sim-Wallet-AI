const {
  getAddressBalance,
  satsToBTC
} = require("./mempool-testnet.cjs");

const address = process.argv[2];

if (!address) {
  console.error("Usage:");
  console.error(
    "node bitcoin-wallet/network/check-balance.cjs <tb1-address>"
  );
  process.exit(1);
}

getAddressBalance(address)
  .then((balance) => {
    console.log("");
    console.log("SIM GUIDES BITCOIN TESTNET");
    console.log("----------------------------");
    console.log(`UTXOs:     ${balance.utxoCount}`);
    console.log(`Confirmed: ${balance.confirmedSats} sats`);
    console.log(`Pending:   ${balance.pendingSats} sats`);
    console.log(`Available: ${balance.availableSats} sats`);
    console.log(
      `Available BTC: ${satsToBTC(balance.availableSats)}`
    );
    console.log("----------------------------");
  })
  .catch((error) => {
    console.error("Balance lookup failed:");
    console.error(error.message);
    process.exit(1);
  });
