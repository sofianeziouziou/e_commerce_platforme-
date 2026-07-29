CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id BIGINT,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    phone_number VARCHAR(30),
    address_line VARCHAR(255),
    city VARCHAR(120),
    governorate VARCHAR(120),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stores_owner FOREIGN KEY (owner_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE admin_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    store_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_profiles_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
);

ALTER TABLE categories ADD COLUMN store_id BIGINT;
ALTER TABLE products ADD COLUMN store_id BIGINT;
ALTER TABLE promotions ADD COLUMN store_id BIGINT;
ALTER TABLE orders ADD COLUMN store_id BIGINT;

INSERT INTO stores (name, slug, description, city, governorate)
VALUES ('FreshMarket Central', 'freshmarket-central', 'Magasin principal de demonstration.', 'Tunis', 'Tunis')
ON CONFLICT (slug) DO NOTHING;

UPDATE categories SET store_id = (SELECT id FROM stores WHERE slug = 'freshmarket-central') WHERE store_id IS NULL;
UPDATE products SET store_id = (SELECT id FROM stores WHERE slug = 'freshmarket-central') WHERE store_id IS NULL;
UPDATE promotions SET store_id = (SELECT id FROM stores WHERE slug = 'freshmarket-central') WHERE store_id IS NULL;
UPDATE orders SET store_id = (SELECT id FROM stores WHERE slug = 'freshmarket-central') WHERE store_id IS NULL;

ALTER TABLE categories ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE promotions ALTER COLUMN store_id SET NOT NULL;

ALTER TABLE categories ADD CONSTRAINT fk_categories_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE;
ALTER TABLE products ADD CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE;
ALTER TABLE promotions ADD CONSTRAINT fk_promotions_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE SET NULL;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_slug_key;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

CREATE UNIQUE INDEX uk_categories_store_slug ON categories (store_id, slug);
CREATE UNIQUE INDEX uk_categories_store_name ON categories (store_id, name);
CREATE UNIQUE INDEX uk_products_store_slug ON products (store_id, slug);
CREATE UNIQUE INDEX uk_products_store_sku ON products (store_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_categories_store_active ON categories (store_id, active);
CREATE INDEX idx_products_store_active ON products (store_id, active);
CREATE INDEX idx_promotions_store_active_dates ON promotions (store_id, active, starts_at, ends_at);
CREATE INDEX idx_orders_store_status ON orders (store_id, status);

CREATE OR REPLACE FUNCTION seed_default_store_catalog(target_store_id BIGINT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO categories (store_id, name, slug, description, image_url, active, display_order)
    VALUES
    (target_store_id, 'Fruits et legumes', 'fruits-legumes', 'Fruits et legumes frais du jour.', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80', true, 1),
    (target_store_id, 'Produits laitiers', 'produits-laitiers', 'Laits, yaourts, fromages et cremerie.', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=900&q=80', true, 2),
    (target_store_id, 'Viandes et volailles', 'viandes-volailles', 'Viandes fraiches et volailles.', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=80', true, 3),
    (target_store_id, 'Poissons et fruits de mer', 'poissons-fruits-mer', 'Produits de la mer selon arrivage.', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=900&q=80', true, 4),
    (target_store_id, 'Pain et viennoiseries', 'pain-viennoiseries', 'Pain, baguettes et viennoiseries.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', true, 5),
    (target_store_id, 'Pates riz et semoule', 'pates-riz-semoule', 'Bases de placard pour repas quotidiens.', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80', true, 6),
    (target_store_id, 'Farines et sucre', 'farines-sucre', 'Farines, sucres et aides patissieres.', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=900&q=80', true, 7),
    (target_store_id, 'Conserves', 'conserves', 'Conserves de legumes, poissons et plats.', 'https://images.unsplash.com/photo-1584473457493-17c4c24290c8?auto=format&fit=crop&w=900&q=80', true, 8),
    (target_store_id, 'Huiles et condiments', 'huiles-condiments', 'Huiles, vinaigres, sauces et condiments.', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80', true, 9),
    (target_store_id, 'Epices', 'epices', 'Epices tunisiennes et melanges culinaires.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80', true, 10),
    (target_store_id, 'Boissons', 'boissons', 'Sodas et boissons familiales.', 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=900&q=80', true, 11),
    (target_store_id, 'Jus', 'jus', 'Jus de fruits et nectars.', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80', true, 12),
    (target_store_id, 'Eau minerale', 'eau-minerale', 'Eaux plates et gazeuses.', 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80', true, 13),
    (target_store_id, 'Cafe et the', 'cafe-the', 'Cafes, thes et infusions.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80', true, 14),
    (target_store_id, 'Petit-dejeuner', 'petit-dejeuner', 'Cereales, confitures et tartinables.', 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=900&q=80', true, 15),
    (target_store_id, 'Biscuits et confiseries', 'biscuits-confiseries', 'Biscuits, chocolats et confiseries.', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=80', true, 16),
    (target_store_id, 'Snacks', 'snacks', 'Chips, fruits secs et encas sales.', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80', true, 17),
    (target_store_id, 'Produits surgeles', 'produits-surgeles', 'Surgeles sales et sucres.', 'https://images.unsplash.com/photo-1601593768794-76f31b2dfb50?auto=format&fit=crop&w=900&q=80', true, 18),
    (target_store_id, 'Produits pour bebe', 'produits-bebe', 'Couches, soins et alimentation bebe.', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80', true, 19),
    (target_store_id, 'Produits hygiene', 'produits-hygiene', 'Hygiene corporelle et soins quotidiens.', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80', true, 20),
    (target_store_id, 'Entretien de la maison', 'entretien-maison', 'Nettoyants et accessoires menagers.', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80', true, 21),
    (target_store_id, 'Detergents', 'detergents', 'Lessives, assouplissants et detergents.', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80', true, 22),
    (target_store_id, 'Articles menagers', 'articles-menagers', 'Articles pratiques pour la maison.', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80', true, 23),
    (target_store_id, 'Nourriture pour animaux', 'nourriture-animaux', 'Croquettes et aliments pour animaux.', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=80', true, 24)
    ON CONFLICT (store_id, slug) DO NOTHING;

    INSERT INTO products (store_id, category_id, name, slug, description, brand, sku, unit_label, price, old_price, image_url, active, featured)
    SELECT target_store_id, c.id, p.name, p.slug, p.description, p.brand, CONCAT('TPL-', target_store_id, '-', p.sku), p.unit_label, p.price, p.old_price, p.image_url, true, p.featured
    FROM (
        VALUES
        ('fruits-legumes', 'Tomates fraiches', 'tomates-fraiches', 'Produit modele a personnaliser selon le stock reel.', 'Catalogue modele', '001', 'kg', 3.900, null::numeric, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=700&q=80', true),
        ('produits-laitiers', 'Lait demi-ecreme', 'lait-demi-ecreme', 'Produit modele a personnaliser selon le stock reel.', 'Catalogue modele', '002', '1 L', 1.650, null::numeric, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=80', true),
        ('viandes-volailles', 'Escalope de poulet', 'escalope-poulet', 'Produit modele a personnaliser selon le stock reel.', 'Catalogue modele', '003', 'kg', 18.900, null::numeric, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=80', true),
        ('pates-riz-semoule', 'Spaghetti', 'spaghetti', 'Produit modele a personnaliser selon le stock reel.', 'Catalogue modele', '004', '500 g', 1.900, null::numeric, 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=700&q=80', true),
        ('eau-minerale', 'Eau minerale pack', 'eau-minerale-pack', 'Produit modele a personnaliser selon le stock reel.', 'Catalogue modele', '005', '6 x 1.5 L', 3.900, null::numeric, 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=700&q=80', true),
        ('detergents', 'Lessive liquide', 'lessive-liquide', 'Produit modele a personnaliser selon le stock reel.', 'Catalogue modele', '006', '2 L', 18.500, null::numeric, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=700&q=80', false)
    ) AS p(category_slug, name, slug, description, brand, sku, unit_label, price, old_price, image_url, featured)
    JOIN categories c ON c.store_id = target_store_id AND c.slug = p.category_slug
    ON CONFLICT (store_id, slug) DO NOTHING;

    INSERT INTO inventory (product_id, quantity, low_stock_threshold)
    SELECT id, 0, 5
    FROM products
    WHERE store_id = target_store_id AND sku LIKE CONCAT('TPL-', target_store_id, '-%')
    ON CONFLICT (product_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT seed_default_store_catalog(id) FROM stores WHERE slug = 'freshmarket-central';

CREATE OR REPLACE FUNCTION seed_catalog_after_store_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM seed_default_store_catalog(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seed_catalog_after_store_insert ON stores;
CREATE TRIGGER trg_seed_catalog_after_store_insert
AFTER INSERT ON stores
FOR EACH ROW
EXECUTE FUNCTION seed_catalog_after_store_insert();
