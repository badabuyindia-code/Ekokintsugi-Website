-- EkoKintsugi Production ESG Schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users Profile (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Catalog
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  co2_factor FLOAT NOT NULL, -- kg per unit
  waste_factor FLOAT NOT NULL, -- kg per unit
  base_price DECIMAL NOT NULL,
  image_url TEXT,
  description TEXT,
  category TEXT,
  sizes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trees Registry
CREATE TABLE IF NOT EXISTS public.trees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  location TEXT,
  status TEXT CHECK (status IN ('seed', 'sapling', 'grown')) DEFAULT 'seed',
  planted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES public.products NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL NOT NULL,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ESG Records (The Impact Ledger)
CREATE TABLE IF NOT EXISTS public.esg_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  co2_saved_kg FLOAT NOT NULL,
  waste_diverted_kg FLOAT NOT NULL,
  tree_id UUID REFERENCES public.trees,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Carbon Credit Ledger
CREATE TABLE IF NOT EXISTS public.carbon_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  credits_earned FLOAT DEFAULT 0,
  credits_used FLOAT DEFAULT 0,
  source_order_id UUID REFERENCES public.orders,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
-- NOTE: In a full production app, the backend would use a SERVICE_ROLE_KEY to bypass RLS, 
-- or forward the user's JWT. Since this environment only uses the VITE_SUPABASE_ANON_KEY, 
-- we must configure policies to allow the backend API to read and write.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_ledger ENABLE ROW LEVEL SECURITY;

-- Allow Anon Key (Backend API) to read and insert data
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.products;
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.orders;
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.esg_records;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.esg_records;
CREATE POLICY "Enable read access for all users" ON public.esg_records FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.esg_records FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.trees;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.trees;
CREATE POLICY "Enable read access for all users" ON public.trees FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.trees FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.carbon_ledger;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.carbon_ledger;
CREATE POLICY "Enable read access for all users" ON public.carbon_ledger FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.carbon_ledger FOR INSERT WITH CHECK (true);

-- Insert Initial Products
INSERT INTO public.products (id, name, co2_factor, waste_factor, base_price, image_url) VALUES
('b1d7d8e0-1234-4a5b-6c7d-8e9f0a1b2c3d', 'Mosaic Wall Art', 5.3, 2.1, 12500, 'https://images.unsplash.com/photo-1549490349-8643362247b5'),
('c2e8e9f1-2345-5b6c-7d8e-9f0a1b2c3d4e', 'Sustainable Planter', 3.1, 1.5, 4500, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411'),
('d3f9f0a2-3456-6c7d-8e9f-0a1b2c3d4e5f', 'Decorative Bowl', 2.8, 0.8, 3200, 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7')
ON CONFLICT (id) DO NOTHING;

-- Intentionally no demo rows tied to a fake auth.users UUID.
-- Create a real user through Supabase Auth first, then insert user-linked demo data if needed.
