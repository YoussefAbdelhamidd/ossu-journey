import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
if (!/@(localhost|127\.0\.0\.1)(:|\/)/.test(url)) {
  console.error("db:reset only runs against localhost. Refusing this DATABASE_URL.");
  process.exit(1);
}

execSync(
  `psql "${url}" -v ON_ERROR_STOP=1 -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'`,
  { stdio: "inherit", env: process.env },
);
execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env });
