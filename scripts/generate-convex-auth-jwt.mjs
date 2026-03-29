/**
 * Generate RS256 key pair for Convex Auth (JWT_PRIVATE_KEY + JWKS).
 * @see https://labs.convex.dev/auth/setup/manual
 *
 * Usage (from repo root):
 *   node scripts/generate-convex-auth-jwt.mjs
 *
 * Updates convex/.env.local in place (JWT_PRIVATE_KEY, JWKS lines).
 * Writes /tmp/cemvp-convex-jwt-for-mcp.json for tooling (delete after use).
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });
const pkLine = privateKey.trimEnd().replace(/\n/g, " ");

function escDoubleQuotes(v) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const envPath = join(process.cwd(), "convex/.env.local");
if (!existsSync(envPath)) {
  console.error("Missing convex/.env.local — create it from convex/.env.example first.");
  process.exit(1);
}

let s = readFileSync(envPath, "utf8");
if (!/^JWT_PRIVATE_KEY=/m.test(s) || !/^JWKS=/m.test(s)) {
  console.error("convex/.env.local must contain JWT_PRIVATE_KEY= and JWKS= lines.");
  process.exit(1);
}

s = s.replace(/^JWT_PRIVATE_KEY=.*$/m, `JWT_PRIVATE_KEY="${escDoubleQuotes(pkLine)}"`);
s = s.replace(/^JWKS=.*$/m, `JWKS="${escDoubleQuotes(jwks)}"`);
writeFileSync(envPath, s);

const tmpJson = "/tmp/cemvp-convex-jwt-for-mcp.json";
const tmpPk = "/tmp/cemvp-jwt-private-key.txt";
const tmpJwks = "/tmp/cemvp-jwks.txt";
writeFileSync(tmpJson, JSON.stringify({ JWT_PRIVATE_KEY: pkLine, JWKS: jwks }, null, 0), "utf8");
writeFileSync(tmpPk, pkLine, "utf8");
writeFileSync(tmpJwks, jwks, "utf8");
console.log("Updated convex/.env.local");
console.log(`Convex CLI (dev deployment):`);
console.log(`  pnpm exec convex env set JWT_PRIVATE_KEY --from-file ${tmpPk}`);
console.log(`  pnpm exec convex env set JWKS --from-file ${tmpJwks}`);
console.log(`Or paste values from ${tmpJson} in the Convex Dashboard.`);
console.log(`Delete ${tmpJson}, ${tmpPk}, and ${tmpJwks} when done.`);
