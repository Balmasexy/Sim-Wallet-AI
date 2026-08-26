import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";

bitcoin.initEccLib(ecc);

const bip32 = BIP32Factory(ecc);

export interface SignableInput {
  txid: string;
  vout: number;
  valueSats: bigint;
  derivationPath: string;
}

export interface SignTransactionRequest {
  mnemonic: string;
  psbtBase64: string;
  inputs: SignableInput[];
}

export interface SignedTransaction {
  psbtBase64: string;
  transactionHex: string;
  inputCount: number;
}

function validateMnemonic(mnemonic: string): void {
  if (!bip39.validateMnemonic(mnemonic.trim())) {
    throw new Error("Invalid Bitcoin recovery phrase");
  }
}

function validateTxid(txid: string): void {
  if (!/^[0-9a-fA-F]{64}$/.test(txid)) {
    throw new Error("Invalid transaction ID");
  }
}

function validateDerivationPath(path: string): void {
  if (!/^m\/84'\/1'\/0'\/0\/\d+$/.test(path)) {
    throw new Error(
      "Only Bitcoin Testnet BIP-84 paths are supported"
    );
  }
}

export function signTestnetTransaction(
  request: SignTransactionRequest
): SignedTransaction {
  validateMnemonic(request.mnemonic);

  if (!request.psbtBase64) {
    throw new Error("PSBT is required");
  }

  if (request.inputs.length === 0) {
    throw new Error("At least one input is required");
  }

  const seed = bip39.mnemonicToSeedSync(
    request.mnemonic.trim()
  );

  const root = bip32.fromSeed(
    seed,
    bitcoin.networks.testnet
  );

  const psbt = bitcoin.Psbt.fromBase64(
    request.psbtBase64,
    {
      network: bitcoin.networks.testnet,
    }
  );

  if (
    psbt.inputCount !== request.inputs.length
  ) {
    throw new Error(
      "PSBT input count does not match signing request"
    );
  }

  for (
    let index = 0;
    index < request.inputs.length;
    index++
  ) {
    const input = request.inputs[index];

    validateTxid(input.txid);
    validateDerivationPath(input.derivationPath);

    const expectedHash =
      Buffer.from(input.txid, "hex").reverse();


    const child = root.derivePath(
      input.derivationPath
    );

    const signer = {
      publicKey: Buffer.from(child.publicKey),
      sign: (hash: Buffer) =>
        Buffer.from(child.sign(hash)),
    };

    psbt.signInput(
      index,
      signer
    );

    void expectedHash;
  }

  for (
    let index = 0;
    index < psbt.inputCount;
    index++
  ) {
    if (!psbt.validateSignaturesOfInput(index, (pubkey, msghash, signature) => ecc.verify(msghash, pubkey, signature))) {
      throw new Error(
        `Invalid signature for input ${index}`
      );
    }

    psbt.finalizeInput(index);
  }

  const transaction =
    psbt.extractTransaction();

  return {
    psbtBase64: psbt.toBase64(),
    transactionHex: transaction.toHex(),
    inputCount: psbt.inputCount,
  };
}
