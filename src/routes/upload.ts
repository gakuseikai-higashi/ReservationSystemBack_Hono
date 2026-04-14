import { Hono } from "hono";
import type { Context } from "hono";
import { supabase, BUCKET } from "../utils/supabase.js";

const upload = new Hono();

// POST /upload
// ✏️ フロントエンドから multipart/form-data で送信
// リクエストフィールド:
//   images: アップロードするファイル（複数可）
//   ✏️ フィールド名を変更する場合は formData.getAll("images") の "images" を変更してください
upload.post("/", async (c: Context) => {
  const formData = await c.req.formData();
  // ✏️ フロントエンド側のフィールド名と合わせてください
  const files = formData.getAll("images");
  if (!files.length) {
    return c.json({ error: "No files uploaded" }, 400);
  }

  const uploadedUrls: string[] = [];
  for (const file of files) {
    if (!(file instanceof File)) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    // ✏️ 保存先フォルダを変更したい場合は filename のパスを編集してください
    // 現在: {タイムスタンプ}_{ファイル名} （バケットのルートに保存）
    const filename = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return c.json({ error: `Upload failed: ${error.message}` }, 500);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    uploadedUrls.push(data.publicUrl);
  }

  return c.json({ uploaded: uploadedUrls });
});

export default upload;