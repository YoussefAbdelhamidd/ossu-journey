import { execSync } from "node:child_process";

const databaseUrl = "postgresql://ossu:ossu@127.0.0.1:5432/ossu_test?sslmode=require";

const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  DIRECT_URL: databaseUrl,
  AUTH_SECRET: "test-secret-test-secret-test-secret-123",
  LEARNER_EMAIL: "momen@ossu.local",
  LEARNER_PASSWORD: "study-at-dawn",
  LEARNER_NAME: "Momen",
  TUTOR_EMAIL: "tutor@ossu.local",
  TUTOR_PASSWORD: "review-desk",
  TUTOR_NAME: "Tutor",
};

export default function setup() {
  execSync(
    `psql "${databaseUrl}" -v ON_ERROR_STOP=1 -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'`,
    { stdio: "inherit", env },
  );
  execSync("npx prisma migrate deploy", { stdio: "inherit", env });
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env });
}
