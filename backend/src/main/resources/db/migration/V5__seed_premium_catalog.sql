INSERT INTO categories (name, slug, description, image_url, active, display_order) VALUES
('Fruits et legumes', 'fruits-legumes', 'Selection quotidienne de produits frais pour les courses familiales.', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80', true, 1),
('Boucherie et volailles', 'boucherie-volailles', 'Viandes, volailles et preparations pour une cuisine genereuse.', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=80', true, 2),
('Produits laitiers', 'produits-laitiers', 'Laits, yaourts, fromages et essentiels du frais.', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=900&q=80', true, 3),
('Epicerie salee', 'epicerie-salee', 'Pates, riz, huiles, conserves et bases de placard.', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80', true, 4),
('Boissons', 'boissons', 'Eaux, jus, sodas et boissons pour toute la maison.', 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=900&q=80', true, 5),
('Maison et entretien', 'maison-entretien', 'Produits utiles pour une maison propre et bien organisee.', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80', true, 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, brand, sku, unit_label, price, old_price, image_url, active, featured)
SELECT c.id, p.name, p.slug, p.description, p.brand, p.sku, p.unit_label, p.price, p.old_price, p.image_url, true, p.featured
FROM (
    VALUES
    ('fruits-legumes', 'Tomates rondes selection', 'tomates-rondes-selection', 'Tomates rouges calibrees, parfaites pour salades, sauces et plats mijotes.', 'Primeur Ziouziou', 'FM-FL-001', 'kg', 3.950, 4.600, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=700&q=80', true),
    ('fruits-legumes', 'Bananes premium', 'bananes-premium', 'Bananes douces et regulieres, selectionnees pour leur maturite.', 'Tropicana Fresh', 'FM-FL-002', 'kg', 5.490, null, 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=700&q=80', true),
    ('fruits-legumes', 'Pommes rouges croquantes', 'pommes-rouges-croquantes', 'Pommes rouges juteuses a chair ferme pour encas et desserts.', 'Verger du Nord', 'FM-FL-003', 'kg', 6.900, 7.900, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=80', false),
    ('boucherie-volailles', 'Escalope de poulet frais', 'escalope-poulet-frais', 'Escalopes de poulet tendres, faciles a griller ou paner.', 'Beldi Selection', 'FM-BV-001', 'kg', 18.900, 21.500, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=80', true),
    ('boucherie-volailles', 'Viande hachee boeuf', 'viande-hachee-boeuf', 'Boeuf hache pour kefta, sauces et preparations familiales.', 'Boucherie Fraiche', 'FM-BV-002', 'kg', 34.900, null, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=700&q=80', false),
    ('produits-laitiers', 'Lait demi-ecreme 1L', 'lait-demi-ecreme-1l', 'Lait UHT demi-ecreme pour le petit dejeuner et les recettes.', 'Delice', 'FM-PL-001', '1 L', 1.650, null, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=80', true),
    ('produits-laitiers', 'Yaourt nature pack familial', 'yaourt-nature-pack-familial', 'Pack pratique de yaourts nature, texture onctueuse.', 'Vitalait', 'FM-PL-002', '8 x 110 g', 4.750, 5.200, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80', true),
    ('produits-laitiers', 'Fromage fondu portions', 'fromage-fondu-portions', 'Portions de fromage fondu pour sandwichs et gouters.', 'President', 'FM-PL-003', '16 portions', 6.800, null, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=80', false),
    ('epicerie-salee', 'Huile d olive vierge extra', 'huile-olive-vierge-extra', 'Huile d olive tunisienne au gout fruite pour cuisson et assaisonnement.', 'Terroir Tunisien', 'FM-ES-001', '1 L', 24.900, 28.500, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=80', true),
    ('epicerie-salee', 'Pates spaghetti', 'pates-spaghetti', 'Spaghetti de ble dur, tenue parfaite a la cuisson.', 'Randa', 'FM-ES-002', '500 g', 1.890, null, 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=700&q=80', true),
    ('epicerie-salee', 'Riz long grain', 'riz-long-grain', 'Riz long grain pour plats quotidiens, accompagnements et salades.', 'Le Chef', 'FM-ES-003', '1 kg', 4.250, 4.850, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80', false),
    ('boissons', 'Eau minerale pack', 'eau-minerale-pack', 'Pack familial d eau minerale pour la maison et le bureau.', 'Sabrine', 'FM-BO-001', '6 x 1.5 L', 3.900, null, 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=700&q=80', true),
    ('boissons', 'Jus orange sans pulpe', 'jus-orange-sans-pulpe', 'Jus d orange frais et equilibre, ideal au petit dejeuner.', 'Tropico', 'FM-BO-002', '1 L', 3.250, 3.900, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=80', true),
    ('boissons', 'Soda cola pack', 'soda-cola-pack', 'Pack de canettes cola pour repas, receptions et moments conviviaux.', 'Coca-Cola', 'FM-BO-003', '6 x 33 cl', 7.900, null, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=80', false),
    ('maison-entretien', 'Lessive liquide fraicheur', 'lessive-liquide-fraicheur', 'Lessive liquide concentree pour linge propre et parfum durable.', 'Omo', 'FM-ME-001', '2 L', 18.500, 21.900, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=700&q=80', true),
    ('maison-entretien', 'Nettoyant multi-surfaces', 'nettoyant-multi-surfaces', 'Nettoyant quotidien pour cuisine, salle de bain et surfaces lavables.', 'Mr Propre', 'FM-ME-002', '1 L', 5.900, null, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=700&q=80', false)
) AS p(category_slug, name, slug, description, brand, sku, unit_label, price, old_price, image_url, featured)
JOIN categories c ON c.slug = p.category_slug
ON CONFLICT (slug) DO NOTHING;

INSERT INTO inventory (product_id, quantity, low_stock_threshold)
SELECT id,
       CASE WHEN slug IN ('viande-hachee-boeuf', 'soda-cola-pack') THEN 0 ELSE 48 END,
       6
FROM products
WHERE sku LIKE 'FM-%'
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO promotions (name, description, discount_type, discount_value, starts_at, ends_at, active) VALUES
('Offres fraicheur du weekend', 'Selection de produits frais a prix reduit pour preparer les courses de la semaine.', 'PERCENTAGE', 15.000, '2026-07-01T00:00:00Z', '2026-08-31T23:59:59Z', true),
('Prix malins maison', 'Economies immediates sur les essentiels du placard et de l entretien.', 'FIXED_AMOUNT', 2.000, '2026-07-01T00:00:00Z', '2026-08-31T23:59:59Z', true)
ON CONFLICT DO NOTHING;

INSERT INTO product_promotions (product_id, promotion_id)
SELECT p.id, promo.id
FROM products p
JOIN promotions promo ON promo.name = 'Offres fraicheur du weekend'
WHERE p.slug IN ('tomates-rondes-selection', 'escalope-poulet-frais', 'yaourt-nature-pack-familial', 'jus-orange-sans-pulpe')
ON CONFLICT DO NOTHING;

INSERT INTO product_promotions (product_id, promotion_id)
SELECT p.id, promo.id
FROM products p
JOIN promotions promo ON promo.name = 'Prix malins maison'
WHERE p.slug IN ('huile-olive-vierge-extra', 'riz-long-grain', 'lessive-liquide-fraicheur')
ON CONFLICT DO NOTHING;
