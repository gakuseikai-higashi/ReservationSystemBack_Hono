import { Hono } from "hono";
import {Context} from "hono";
import { cors } from "hono/cors";
import reservations from "./routes/reservations.js";
import auth from "./routes/auth.js";
import upload from "./routes/upload.js";

const app = new Hono();

console.log("FRONTEND_URL", process.env.FRONTEND_URL); // FRONTEND_URLの値をログに出力

app.use("*", cors({
  origin: process.env.FRONTEND_URL || "",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  exposeHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.get("/", (c: Context) => c.json({ status: "OK" }));
app.route("/api/reservations", reservations);
app.route("/api/auth", auth);
app.route("/upload", upload);

export default app;
