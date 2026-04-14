import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { authenticateUser, createAccessToken, verifyToken } from "../utils/auth.js";

const auth = new Hono();

const LoginRequest = z.object({
  username: z.string(),
  password: z.string(),
});

auth.post("/login", async (c: Context) => {
  const body = await c.req.json();
  const parsed = LoginRequest.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid request" }, 400);
  }
  const { username, password } = parsed.data;
  const user = authenticateUser(username, password);
  if (!user) {
    return c.json({ error: "ユーザー名またはパスワードが間違っています" }, 401);
  }
  const accessToken = await createAccessToken({ sub: user.username });
  return c.json({
    accessToken: accessToken,
    tokenType: "bearer",
    expiresIn: 60 * 60,
    userInfo: { username: user.username, role: user.role },
  });
});

auth.get("/verify", async (c: Context) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Authorization header missing or malformed" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const user = await verifyToken(token);
    return c.json({ valid: true, user });
  } catch (err: any) {
    return c.json({ valid: false, error: err.message }, 401);
  }
})

export default auth;