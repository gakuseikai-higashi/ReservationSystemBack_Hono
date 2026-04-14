import { createClient } from "@supabase/supabase-js";

// Supabaseクライアント
// ✏️ 編集不要: 接続情報は .env の SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY で管理
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const BUCKET = process.env.SUPABASE_BUCKET || "images";
