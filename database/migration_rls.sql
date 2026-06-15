-- ═══════════════════════════════════════════════════════
-- 猫录助手小程序 — RLS 公开读取策略
-- 执行环境: MemFire SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── cats 表：允许任何人浏览猫咪档案 ─────────────────
-- Tab1 猫咪广场 + Tab2 猫咪领养 均无需登录即可查看

DROP POLICY IF EXISTS "Public read cats" ON cats;
CREATE POLICY "Public read cats"
  ON cats
  FOR SELECT
  USING (true);

-- ── blacklist_reports 表：允许任何人查看已确认的举报 ─
-- Tab2 黑名单页面无需登录

DROP POLICY IF EXISTS "Public read blacklist_reports" ON blacklist_reports;
CREATE POLICY "Public read blacklist_reports"
  ON blacklist_reports
  FOR SELECT
  USING (status = 'confirmed');

-- ── 验证 ────────────────────────────────────────────
-- 执行后运行以下 SELECT，应返回记录数 > 0
SELECT count(*) FROM cats;
