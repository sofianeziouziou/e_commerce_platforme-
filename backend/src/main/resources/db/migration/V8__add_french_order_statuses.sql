DO $$
BEGIN
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_status;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE orders ADD CONSTRAINT chk_orders_status CHECK (
    status IN ('EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE')
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders (customer_id, status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product ON cart_items (cart_id, product_id);
