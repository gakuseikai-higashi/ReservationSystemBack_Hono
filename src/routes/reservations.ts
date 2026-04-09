import { Hono } from "hono";
import type { Context } from "hono";
import { ReservationRoom, ReservationStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
const reservations = new Hono();

// 管理者: 予約一覧取得（?date=YYYY-MM-DD）
reservations.get("/all", async (c: Context) => {
  // 認可ミドルウェアを後で追加
  const date = c.req.query("date");
  const where = date ? { reservationDate: new Date(date) } : {};
  const all = await prisma.reservation.findMany({
    where,
    orderBy: date ? { startTime: "asc" } : { id: "asc" },
  });
  return c.json(all);
});

// 管理者: 単一予約取得
reservations.get("/detail/:id", async (c: Context) => {
  const id = Number(c.req.param("id"));
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(reservation);
});

// 一般: 部屋ごとの予約一覧取得（?date=YYYY-MM-DD）
reservations.get("/:room", async (c: Context) => {
  const room = c.req.param("room");
  const date = c.req.query("date");
  const where: any = {
    room,
    status: ReservationStatus.APPROVED,
  };
  if (date) where.reservationDate = new Date(date);
  const list = await prisma.reservation.findMany({
    where,
    orderBy: date ? { startTime: "asc" } : { id: "asc" },
  });
  return c.json(list);
});

// 一般: 予約作成
import { z } from "zod";

const ReservationCreateRequest = z.object({
  reservatorName: z.string().min(1),
  clubName: z.string().optional(),
  studentId: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  room: z.nativeEnum(ReservationRoom),
  purpose: z.string().min(1),
  numPeople: z.number().int().min(1),
  reservationDate: z.string().refine((v) => !isNaN(new Date(v).getTime()), {
    message: "reservationDate must be a valid date string",
  }),
  startTime: z.string(),
  endTime: z.string(),
});

reservations.post("/create", async (c: Context) => {
  const body = await c.req.json();
  const parsed = ReservationCreateRequest.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid request", details: parsed.error.issues }, 400);
  }
  const data = parsed.data;
  // 一意な64文字トークン生成
  const token = Array.from({ length: 64 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 62)
    )
  ).join("");
  // "HH:MM" 形式の場合は reservationDate と結合してDateに変換するヘルパー
  const toDate = (dateStr: string, timeStr: string): Date => {
    // すでにISO文字列ならそのまま変換
    if (!isNaN(new Date(timeStr).getTime()) && timeStr.includes("T")) {
      return new Date(timeStr);
    }
    // "HH:MM" 形式の場合は日付と結合（JST: +09:00）
    const datePart = dateStr.split("T")[0];
    return new Date(`${datePart}T${timeStr}:00+09:00`);
  };

  // Prisma enum型に変換
  const created = await prisma.reservation.create({
    data: {
      ...data,
      room: data.room,
      numPeople: Number(data.numPeople),
      reservationDate: new Date(data.reservationDate),
      startTime: toDate(data.reservationDate, data.startTime),
      endTime: toDate(data.reservationDate, data.endTime),
      token,
    },
  });

  return c.json(created, 201);
});

// トークンベース: キャンセルページ取得
reservations.get("/cancel/:token", async (c: Context) => {
  const token = c.req.param("token");
  const reservation = await prisma.reservation.findFirst({ where: { token } });
  if (!reservation) {
    return c.json({ error: "Not found" }, 404);
  }
  // TODO: ステータス・時刻チェック
  return c.json(reservation);
});

// トークンベース: 返却ページ取得
reservations.get("/return/:token", async (c: Context) => {
  const token = c.req.param("token");
  const reservation = await prisma.reservation.findFirst({ where: { token } });
  if (!reservation) {
    return c.json({ error: "Not found" }, 404);
  }
  // TODO: ステータス・時刻チェック
  return c.json(reservation);
});

// 管理者: 予約承認
reservations.put("/detail/:id/approve", async (c: Context) => {
  const id = Number(c.req.param("id"));
  // TODO: 認可
  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.APPROVED },
  });
  return c.json({ message: "予約を承認しました", updated });
});

// 管理者: 予約完了
reservations.put("/detail/:id/complete", async (c: Context) => {
  const id = Number(c.req.param("id"));
  // TODO: 認可
  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.COMPLETED },
  });
  return c.json({ message: "予約を完了しました", updated });
});

// 管理者: 予約キャンセル
reservations.put("/detail/:id/cancel", async (c: Context) => {
  const id = Number(c.req.param("id"));
  // TODO: 認可
  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.CANCELLED },
  });
  return c.json({ message: "予約をキャンセルしました", updated });
});

// 管理者: 予約却下
reservations.put("/detail/:id/reject", async (c: Context) => {
  const id = Number(c.req.param("id"));
  // TODO: 認可
  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.REJECTED },
  });
  return c.json({ message: "予約を却下しました", updated });
});

// 管理者: 予約返却
reservations.put("/detail/:id/return", async (c: Context) => {
  const id = Number(c.req.param("id"));
  // TODO: 画像アップロード・認可
  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.RETURNED },
  });
  return c.json({ message: "予約を返却しました", updated });
});

// 管理者: 予約削除
reservations.delete("/detail/:id", async (c: Context) => {
  const id = Number(c.req.param("id"));
  // TODO: 認可・画像削除
  await prisma.reservation.delete({ where: { id } });
  return c.body(null, 204);
});

export default reservations;