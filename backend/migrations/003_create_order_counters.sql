-- MIGRATION 003: contador dos números de pedido (2026-0001, 2026-0002...), um por ano.
-- Com ele, o número de um pedido cancelado nunca é usado de novo por outro pedido.
CREATE TABLE order_counters (
  year INTEGER PRIMARY KEY,
  last INTEGER NOT NULL DEFAULT 0
);

-- Se já existirem pedidos, o contador começa do maior número de cada ano.
INSERT INTO order_counters (year, last)
SELECT CAST(substr(id, 1, 4) AS INTEGER), MAX(CAST(substr(id, 6) AS INTEGER))
FROM orders
GROUP BY 1;
