-- MIGRATION 002: índices para as consultas mais comuns (filtros da loja e "meus pedidos").
CREATE INDEX idx_products_brand    ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_gender   ON products(gender);
CREATE INDEX idx_products_state    ON products(state);
CREATE INDEX idx_product_images_product ON product_images(product_id, position);
CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
