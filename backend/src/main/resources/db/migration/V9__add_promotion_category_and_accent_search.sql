ALTER TABLE promotions ADD COLUMN category_id BIGINT;
ALTER TABLE promotions ADD CONSTRAINT fk_promotions_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL;
CREATE INDEX idx_promotions_category_id ON promotions (category_id);

CREATE EXTENSION IF NOT EXISTS unaccent;
