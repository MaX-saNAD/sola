-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text default '',
  description text default '',
  price numeric not null default 0,
  size text default '',
  image_url text default '',
  stock integer not null default 0,
  visible boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value text not null default ''
);

-- Lock the tables: only the server (service key) can touch them.
alter table products enable row level security;
alter table settings enable row level security;

-- Public bucket for product images
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Default products
insert into products (name, tagline, description, price, size, image_url, stock, sort) values
('Inferno – sola', 'More than a fragrance .. a signature',
 'A bold scent that leaves a lasting impression.', 850, '50 ml', '/products/inferno.png', 50, 1),
('Violet Soul – sola', 'Your glow, your aura, your story.',
 'A captivating fragrance that reveals your inner elegance.', 799, '50 ml', '/products/violet-soul.png', 50, 2);

insert into settings (key, value) values
('whatsapp', '201005226506'),
('instagram', 'https://www.instagram.com/sola_cosmatics'),
('tiktok', 'https://www.tiktok.com/@sola_cosmatics'),
('facebook', 'https://www.facebook.com/share/1FNz7bcWtf/')
on conflict (key) do nothing;
