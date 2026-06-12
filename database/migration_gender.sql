-- 新增性别字段
ALTER TABLE cats ADD COLUMN gender TEXT;  -- 'male' | 'female' | NULL

COMMENT ON COLUMN cats.gender IS '性别: male=男孩, female=女孩, NULL=未知';
