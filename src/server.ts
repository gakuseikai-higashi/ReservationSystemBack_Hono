import "dotenv/config";
import app from "./index";
import { serve } from "@hono/node-server";
import { promises as fs } from "fs";
import { execSync } from "child_process";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// uploadsディレクトリ自動作成
fs.mkdir("uploads", { recursive: true }).catch(() => {});

// DBマイグレーション（プロセス内で実行することで環境変数を引き継ぐ）
try {
  console.log("Running prisma migrate deploy...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("Migration completed.");
} catch (e) {
  console.error("Migration failed:", e);
}

serve({
  fetch: app.fetch,
  port,
});

console.log(`Hono server running at http://localhost:${port}`);
