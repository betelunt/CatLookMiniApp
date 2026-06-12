-- ═══════════════════════════════════════════════════════
-- 猫录助手小程序 — 安全迁移 SQL
-- ✅ 仅新增字段，不改动现有数据
-- ✅ 全部可空/有默认值，Flutter App 无感知
-- ✅ 可在线上数据库直接执行
-- ═══════════════════════════════════════════════════════

-- ── 1. cats 表新增 5 个字段 ─────────────────────────────
-- 注意: is_neutered 已存在，跳过；description 复用为 appearance

ALTER TABLE cats
  ADD COLUMN IF NOT EXISTS breed           TEXT,
  ADD COLUMN IF NOT EXISTS age             TEXT,
  ADD COLUMN IF NOT EXISTS personality     TEXT,
  ADD COLUMN IF NOT EXISTS adoption_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS city            TEXT;

-- 可选：把现有的 description 同步给小程序用（不改原数据）
-- ALTER TABLE cats ADD COLUMN IF NOT EXISTS appearance TEXT;
-- 如果不想加 appearance 列，小程序代码里用 description 字段即可

-- 领养状态索引（领养列表高频查询）
CREATE INDEX IF NOT EXISTS idx_cats_adoption_status ON cats(adoption_status);

-- ── 2. 创建领养协议表 ───────────────────────────────────

CREATE TABLE IF NOT EXISTS adoption_agreements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id          UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  rescuer_user_id UUID NOT NULL,
  adopter_user_id UUID,
  original_url    TEXT NOT NULL,
  blurred_url     TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreements_cat    ON adoption_agreements(cat_id);
CREATE INDEX IF NOT EXISTS idx_agreements_rescuer ON adoption_agreements(rescuer_user_id);

-- ── 3. updated_at 自动更新触发器 ─────────────────────────

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- adoption_agreements 触发器
DROP TRIGGER IF EXISTS trg_agreements_updated_at ON adoption_agreements;
CREATE TRIGGER trg_agreements_updated_at
  BEFORE UPDATE ON adoption_agreements
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
