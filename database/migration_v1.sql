-- ═══════════════════════════════════════════════════════
-- 猫录助手小程序 — 数据库迁移 v1
-- 执行环境: Supabase (MemFire)
-- ═══════════════════════════════════════════════════════

-- ── 1. cats 表新增字段 ──────────────────────────────────

ALTER TABLE cats
  ADD COLUMN IF NOT EXISTS age            TEXT,          -- 年龄: '<1', '1', '2', '3', '4+'
  ADD COLUMN IF NOT EXISTS is_neutered    BOOLEAN DEFAULT FALSE, -- 是否绝育
  ADD COLUMN IF NOT EXISTS personality    TEXT,          -- 性格描述
  ADD COLUMN IF NOT EXISTS adoption_status TEXT DEFAULT 'none',  -- 领养状态: none/seeking/adopted
  ADD COLUMN IF NOT EXISTS city           TEXT;          -- 所在城市

-- 为 adoption_status 添加索引（领养列表查询高频）
CREATE INDEX IF NOT EXISTS idx_cats_adoption_status ON cats(adoption_status);

-- ── 2. 创建领养协议表 ───────────────────────────────────

CREATE TABLE IF NOT EXISTS adoption_agreements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id          UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  rescuer_user_id UUID NOT NULL,                        -- 救助人（上传协议者）
  adopter_user_id UUID,                                 -- 领养人（签署后填入）
  original_url    TEXT NOT NULL,                        -- 原文件 Storage URL
  blurred_url     TEXT,                                 -- 模糊副本 Storage URL
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreements_cat    ON adoption_agreements(cat_id);
CREATE INDEX IF NOT EXISTS idx_agreements_rescuer ON adoption_agreements(rescuer_user_id);

-- ── 3. user_identities 新增字段 ─────────────────────────

ALTER TABLE user_identities
  ADD COLUMN IF NOT EXISTS wechat_unionid TEXT;         -- 微信 unionid（跨应用用户关联）

-- ── 4. 更新 updated_at 触发器 ──────────────────────────

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 如果 cats 表没有 updated_at 列则添加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cats' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE cats ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 为 cats 表挂触发器
DROP TRIGGER IF EXISTS trg_cats_updated_at ON cats;
CREATE TRIGGER trg_cats_updated_at
  BEFORE UPDATE ON cats
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 为 adoption_agreements 表挂触发器
DROP TRIGGER IF EXISTS trg_agreements_updated_at ON adoption_agreements;
CREATE TRIGGER trg_agreements_updated_at
  BEFORE UPDATE ON adoption_agreements
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
