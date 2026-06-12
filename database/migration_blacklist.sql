-- ═══════════════════════════════════════════════════════
-- 猫录助手小程序 — 黑名单功能 Migration
-- ✅ 新增 blacklist_reports 表
-- ✅ 包含 phone/wechat_id 至少一项的约束
-- ✅ 审核状态 + 证实列表
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS blacklist_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role            TEXT NOT NULL CHECK (role IN ('adopter', 'rescuer')),
  real_name       TEXT,
  gender          TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  id_number       TEXT,
  wechat_nickname TEXT,
  phone           TEXT,
  wechat_id       TEXT,
  city            TEXT NOT NULL,
  address         TEXT,
  category        TEXT NOT NULL,
  description     TEXT NOT NULL,
  evidence_urls   JSONB DEFAULT '[]'::jsonb,
  reporter_name   TEXT NOT NULL,
  reporter_wx     TEXT NOT NULL,
  reporter_phone  TEXT NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  confirmations   JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT phone_or_wechat CHECK (
    (phone IS NOT NULL AND phone != '') OR (wechat_id IS NOT NULL AND wechat_id != '')
  )
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_blacklist_status ON blacklist_reports(status);
CREATE INDEX IF NOT EXISTS idx_blacklist_role   ON blacklist_reports(role);
CREATE INDEX IF NOT EXISTS idx_blacklist_city   ON blacklist_reports(city);
CREATE INDEX IF NOT EXISTS idx_blacklist_created ON blacklist_reports(created_at DESC);

-- updated_at 触发器
DROP TRIGGER IF EXISTS trg_blacklist_updated_at ON blacklist_reports;
CREATE TRIGGER trg_blacklist_updated_at
  BEFORE UPDATE ON blacklist_reports
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
