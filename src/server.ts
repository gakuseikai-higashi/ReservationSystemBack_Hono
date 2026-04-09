import "dotenv/config";
import app from "./index";
import { serve } from "@hono/node-server";
import { promises as fs } from "fs";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// uploadsディレクトリ自動作成
fs.mkdir("uploads", { recursive: true }).catch(() => {});

serve({
  fetch: app.fetch,
  port,
});

console.log(`Hono server running at http://localhost:${port}`);
