import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";

bitcoin.initEccLib(ecc);

export interface TransactionInput {
  txid: string;
  vout: number;
  valueSats: bigint;
}

export interface TransactionOutput {
  address: string;
  valueSats: bigint;
}

export interface UnsignedTransaction {
  hex: string;
  inputCount: number;
  outputCount: number;
  totalInputSats: bigint;
  totalOutputSats: bigint;
  feeSats: bigint;
}

function validateTxid(txid: string): void {
  if (!/^[0-9a-fA-F]{64}$/.test(txid)) {
    throw new Error("Invalid transaction ID");
  }
}

function validateAddress(address: string): void {
  try {
    bitcoin.address.toOutputScript(
      address,
      bitcoin.networks.testnet
    );
  } catch {
    throw new Error(
      "Invalid Bitcoin Testnet address"
    );
  }
}

export function buildUnsignedTransaction(
  inputs: TransactionInput[],
  outputs: TransactionOutput[]
): UnsignedTransaction {
  if (inputs.length === 0) {
    throw new Error("At least one input is required");
  }

  if (outputs.length === 0) {
    throw new Error("At least one output is required");
  }

  for (const input of inputs) {
    validateTxid(input.txid);

    if (input.vout < 0) {
      throw new Error("Invalid input index");
    }

    if (input.valueSats <= 0n) {
      throw new Error(
        "Input value must be greater than zero"
      );
    }
  }

  for (const output of outputs) {
    validateAddress(output.address);

    if (output.valueSats <= 0n) {
      throw new Error(
        "Output value must be greater than zero"
      );
    }
  }

  const totalInputSats = inputs.reduce(
    (total, input) =>
      total + input.valueSats,
    0n
  );

  const totalOutputSats = outputs.reduce(
    (total, output) =>
      total + output.valueSats,
    0n
  );

  if (totalOutputSats >= totalInputSats) {
    throw new Error(
      "Outputs must be less than total inputs"
    );
  }

  const feeSats =
    totalInputSats - totalOutputSats;

  const psbt = new bitcoin.Psbt({
    network: bitcoin.networks.testnet,
  });

  for (const input of inputs) {
    psbt.addInput({
      hash: input.txid,
      index: input.vout,
    });
  }

  for (const output of outputs) {
    psbt.addOutput({
      address: output.address,
      value: output.valueSats,
    });
  }

  return {
    hex: psbt.toHex(),
    inputCount: inputs.length,
    outputCount: outputs.length,
    totalInputSats,
    totalOutputSats,
    feeSats,
  };
}
