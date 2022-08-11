import * as fs from 'fs';
import * as path from 'path';
import assert from 'assert';
import { exec } from 'child_process';
import { expect } from 'chai';
import BigNumber from 'bignumber.js';

export async function sh(cmd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

const warpBin = path.resolve(__dirname, '..', 'bin', 'warp');
const warpVenvPrefix = `PATH=${path.resolve(__dirname, '..', 'warp_venv', 'bin')}:$PATH`;

export function transpile(contractPath: string): Promise<{ stdout: string; stderr: string }> {
  return sh(`${warpBin} transpile ${contractPath}`);
}

export function starknetCompile(
  cairoPath: string,
  jsonOutputPath: string,
): Promise<{ stdout: string; stderr: string }> {
  return sh(
    `${warpVenvPrefix} starknet-compile --cairo_path warp_output ${cairoPath} --output ${jsonOutputPath}`,
  );
}

export function batchPromises<In, Out>(
  inputs: In[],
  parallelCount: number,
  func: (i: In) => Promise<Out>,
): SafePromise<Out>[] {
  const unwrappedPromises: Promise<Out>[] = [];

  for (let i = 0; i < inputs.length; ++i) {
    if (i < parallelCount) {
      unwrappedPromises.push(func(inputs[i]));
    } else {
      unwrappedPromises.push(
        unwrappedPromises[i - parallelCount].then(
          () => func(inputs[i]),
          () => func(inputs[i]),
        ),
      );
    }
  }

  return unwrappedPromises.map(wrapPromise);
}

export type SafePromise<T> = Promise<
  { success: true; result: T } | { success: false; result: unknown }
>;

export function wrapPromise<T>(promise: Promise<T>): SafePromise<T> {
  return promise.then(
    (res) => ({ success: true, result: res }),
    (reason) => ({ success: false, result: reason }),
  );
}

export function cleanupSync(path: string): void {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

export function validateInput(input: string): void {
  const num = BigInt(input);
  assert(
    num >= 0n,
    "Negative numbers should not be passed to tests, please convert to two's complement",
  );
}

export function processArgs(
  name: string,
  args: string[],
  deployedAddresses: Map<string, { address: string; hash: string }>,
): string[] {
  return args.flatMap((arg) => {
    if (arg.startsWith('address@')) {
      arg = arg.replace('address@', '');
      const value = deployedAddresses.get(arg);
      if (value === undefined) {
        expect.fail(`${name} failed, cannot find address ${arg}`);
      }
      return BigInt(value.address).toString();
    } else if (arg.startsWith('hash@')) {
      arg = arg.replace('hash@', '');
      const value = deployedAddresses.get(arg);
      if (value === undefined) {
        expect.fail(`${name} failed, cannot find address ${arg}`);
      }
      const low = BigInt(value.hash) % 2n ** 128n;
      const high = BigInt(value.hash) / 2n ** 128n;
      return [low.toString(), high.toString()];
    } else if (arg.startsWith('cache@')) {
      const value = deployedAddresses.get(arg);
      // console.log(deployedAddresses.keys());
      // console.log(`Args found ${arg}`);
      if (value === undefined) {
        expect.fail(`${name} failed, cannot find value in cache ${arg}`);
      }
      return value.address;
    }
    return arg;
  });
}
export function hashToUint256(hash: string): [string, string] {
  // hash is an array of bytes treated as a string,
  // this converts it to a single bignum with the same bytes
  const bigintHash = [...hash].reduce((acc, c) => (acc << 8n) + BigInt(c.charCodeAt(0)), 0n);

  // We treat class hashes as uint256s due to the lack of a felt type in solidity
  const high = bigintHash / 2n ** 128n;
  const low = bigintHash % 2n ** 128n;
  return [low.toString(10), high.toString(10)];
}
// returns the sqrt price as a 64x96
export function encodePriceSqrt(reserve1: string, reserve0: string): string {
  const x = new BigNumber(reserve1)
    .div(reserve0)
    .sqrt()
    .multipliedBy(new BigNumber(2).pow(96))
    .integerValue(3)
    .toString(16);
  return x;
}
