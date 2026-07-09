/**
 * Script untuk generate hash password admin baru.
 *
 * Cara pakai:
 *   node scripts/generate-admin-hash.js password_baru_kamu
 *
 * Hasil hash-nya bisa langsung dipakai untuk UPDATE password admin di Supabase:
 *   update admins set password_hash = 'hasil_hash_di_sini' where email = 'email@kamu.com';
 */
const { randomBytes, scrypt, timingSafeEqual } = require("crypto");
const { promisify } = require("util");

const scryptAsync = promisify(scrypt);

const N = 16384;
const r = 8;
const p = 1;
const keyLen = 64;

async function hashPassword(plain) {
  const salt = randomBytes(16);
  const key = await scryptAsync(plain, salt, keyLen, { N, r, p });
  return ["scrypt", N, r, p, salt.toString("hex"), key.toString("hex")].join("$");
}

async function verifyPassword(plain, stored) {
  const [scheme, nStr, rStr, pStr, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt") return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const key = await scryptAsync(plain, salt, expected.length, {
    N: Number(nStr),
    r: Number(rStr),
    p: Number(pStr),
  });
  return timingSafeEqual(key, expected);
}

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error("Cara pakai: node scripts/generate-admin-hash.js password_baru_kamu");
    process.exit(1);
  }

  const hash = await hashPassword(password);
  const valid = await verifyPassword(password, hash);

  console.log("\n=== Hash Password Baru ===");
  console.log(hash);
  console.log("\nVerifikasi:", valid ? "✅ Valid" : "❌ Gagal");
  console.log("\nJalankan SQL ini di Supabase SQL Editor untuk update password admin:");
  console.log(`\nupdate admins set password_hash = '${hash}' where email = 'email_admin@kamu.com';\n`);
}

main();
