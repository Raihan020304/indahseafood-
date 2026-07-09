import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

function scryptPromise(
  password: string,
  salt: Buffer,
  keylen: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = randomBytes(16);

  const derivedKey = await scryptPromise(
    plainPassword,
    salt,
    KEY_LEN
  );

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join("$");
}
export async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [scheme, nStr, rStr, pStr, saltHex, hashHex] =
      storedHash.split("$");

    if (scheme !== "scrypt") return false;

    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");

    const derivedKey = await scryptPromise(
      plainPassword,
      salt,
      expected.length
    );

    return timingSafeEqual(derivedKey, expected);
  } catch {
    return false;
  }
}
