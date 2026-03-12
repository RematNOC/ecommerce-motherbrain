-- MotherBrain Engine Schema

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  sku TEXT UNIQUE,
  inventory_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for active products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access to products" ON products FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Admins full access to orders" ON orders FOR ALL TO authenticated USING (TRUE);
