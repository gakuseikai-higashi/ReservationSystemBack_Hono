import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";

const SECRET_KEY = process.env.SECRET_KEY || "changeme";
const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_MINUTES = 60;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";
const BCRYPT_ROUNDS = 10;

// 起動時に一度だけハッシュ化して保持
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, BCRYPT_ROUNDS);

// パスワードハッシュ化
export function getPasswordHash(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

// パスワード検証
export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

// 管理者認証
export function authenticateUser(username: string, password: string): { username: string; role: string } | null {
  if (username !== ADMIN_USERNAME) {
    return null;
  }
  if (!verifyPassword(password, ADMIN_PASSWORD_HASH)) {
    return null;
  }
  return { username, role: "admin" };
}

// JWT生成
export async function createAccessToken(data: object, expiresInSec?: number): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + (expiresInSec || ACCESS_TOKEN_EXPIRE_MINUTES * 60);
  const payload = { ...data, exp };
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(SECRET_KEY));
}

// JWT検証
export async function verifyToken(token: string): Promise<{ username: string; role: string }> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY), {
      algorithms: [ALGORITHM],
    });
    if (payload.sub !== ADMIN_USERNAME) throw new Error("Invalid user");
    return { username: payload.sub as string, role: "admin" };
  } catch {
    throw new Error("Invalid token");
  }
}
