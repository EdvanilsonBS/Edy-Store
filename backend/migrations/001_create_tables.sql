-- MIGRATION 001: cria as tabelas da loja.
-- Cada arquivo de migrations/ roda UMA vez, em ordem alfabética, e fica registrado na tabela
-- schema_migrations. Para mudar o banco no futuro, crie um arquivo novo (003_...sql); nunca edite
-- um que já rodou.

-- Usuários. role: 'user' (cliente) ou 'admin' (pode gerenciar produtos e todos os pedidos).
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Produtos. sizes e colors são listas pequenas guardadas como JSON (texto).
-- search_text = "nome marca categoria gênero" sem acentos e em minúsculas, usado na busca.
CREATE TABLE products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  brand          TEXT NOT NULL,
  category       TEXT NOT NULL,
  gender         TEXT NOT NULL CHECK (gender IN ('Masculino', 'Feminino', 'Unisex')),
  state          TEXT NOT NULL CHECK (state IN ('Novo', 'Usado')),
  price          REAL NOT NULL CHECK (price > 0),
  price_discount REAL CHECK (price_discount IS NULL OR (price_discount > 0 AND price_discount < price)),
  image          TEXT NOT NULL,
  reference      TEXT,
  stars          REAL NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 5),
  rating         INTEGER NOT NULL DEFAULT 0 CHECK (rating >= 0),
  description    TEXT NOT NULL DEFAULT '',
  sizes          TEXT NOT NULL DEFAULT '[]',
  colors         TEXT NOT NULL DEFAULT '[]',
  search_text    TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Fotos da galeria do produto (1 produto -> N imagens). Apagar o produto apaga as fotos.
CREATE TABLE product_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  src        TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0
);

-- Pedidos. id no formato 2026-0001. Apagar o usuário apaga os pedidos dele.
CREATE TABLE orders (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'shipping', 'delivered')),
  total      REAL NOT NULL CHECK (total >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Itens do pedido (1 pedido -> N itens). Nome, foto e preço são COPIADOS do produto no momento
-- da compra: assim o pedido não muda se o produto for editado, e continua existindo se ele for
-- excluído (product_id vira NULL).
CREATE TABLE order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  image      TEXT,
  size       TEXT NOT NULL,
  color      TEXT,
  quantity   INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
  unit_price REAL NOT NULL CHECK (unit_price > 0),
  subtotal   REAL NOT NULL CHECK (subtotal > 0)
);
