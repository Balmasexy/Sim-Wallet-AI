import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";

bitcoin.initEccLib(ecc);

const bip32 = BIP32Factory(ecc);

export type NetworkName = "testnet" | "mainnet";

function getNetwork(name: NetworkName): bitcoin.Network {
  return name === "mainnet"
    ? bitcoin.networks.bitcoin
    : bitcoin.networks.testnet;
}

export function generateRecoveryPhrase(): string {
  return bip39.generateMnemonic(256);
}

export function validateRecoveryPhrase(
  mnemonic: string
): boolean {
  return bip39.validateMnemonic(mnemonic.trim());
}

export function createBitcoinAccount(
  mnemonic: string,
  networkName: NetworkName = "testnet",
  addressIndex = 0
) {
  if (!validateRecoveryPhrase(mnemonic)) {
    throw new Error("Invalid Bitcoin recovery phrase");
  }

  const network = getNetwork(networkName);

  const seed = bip39.mnemonicToSeedSync(mnemonic);

  const root = bip32.fromSeed(seed, network);

  const coinType = networkName === "mainnet" ? 0 : 1;

  const derivationPath =
    `m/84'/${coinType}'/0'/0/${addressIndex}`;

  const child = root.derivePath(derivationPath);

  const payment = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(child.publicKey),
    network,
  });

  if (!payment.address) {
    throw new Error("Unable to generate Bitcoin address");
  }

  return {
    network: networkName,
    address: payment.address,
    publicKey: Buffer.from(child.publicKey).toString("hex"),
    derivationPath,
  };
}

export function createBitcoinWallet(
  networkName: NetworkName = "testnet"
) {
  const mnemonic = generateRecoveryPhrase();

  const account = createBitcoinAccount(
    mnemonic,
    networkName
  );

  return {
    mnemonic,
    account,
  };
}
