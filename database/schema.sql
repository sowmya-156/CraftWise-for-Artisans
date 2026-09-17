-- ============================================================
-- CRAFTWISE DATABASE SCHEMA (PostgreSQL Relational DDL)
-- SIH26090: AI-Driven Market Linkage & Smart Cataloging for Marginalized Artisans
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'artisan' CHECK (role IN ('artisan', 'buyer', 'admin')),
    preferred_language VARCHAR(16) DEFAULT 'te',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artisan_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    craft_type VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    village_or_city VARCHAR(128) NOT NULL,
    cooperative_name VARCHAR(255),
    years_of_experience INTEGER DEFAULT 0,
    craft_description TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    artisan_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    detailed_description TEXT,
    craft_category VARCHAR(128),
    materials JSONB DEFAULT '[]'::jsonb,
    handmade_attributes JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) DEFAULT 'draft' CHECK (status IN ('draft', 'ready_for_review', 'published', 'low_stock', 'out_of_stock')),
    is_approved_by_artisan BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    price NUMERIC(10, 2) DEFAULT 0.00,
    stock INTEGER DEFAULT 1,
    primary_image TEXT,
    enhanced_image TEXT,
    preferred_image VARCHAR(16) DEFAULT 'enhanced' CHECK (preferred_image IN ('original', 'enhanced')),
    voice_notes TEXT,
    voice_transcript TEXT,
    detected_language VARCHAR(32) DEFAULT 'te',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    enhanced_url TEXT,
    active_type VARCHAR(16) DEFAULT 'enhanced',
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voice_inputs (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    audio_url TEXT,
    detected_language VARCHAR(32) DEFAULT 'te',
    transcript TEXT,
    raw_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_processings (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'pending',
    stages JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_demo_ai_mode BOOLEAN DEFAULT FALSE,
    model_used VARCHAR(64) DEFAULT 'gemini-3.8-flash',
    authenticity_guard_passed BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS translations (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    language_code VARCHAR(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    detailed_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, language_code)
);

CREATE TABLE IF NOT EXISTS price_recommendations (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    suggested_min NUMERIC(10, 2) NOT NULL,
    suggested_max NUMERIC(10, 2) NOT NULL,
    artisan_cost NUMERIC(10, 2) DEFAULT 0.00,
    final_price NUMERIC(10, 2) NOT NULL,
    breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    low_stock_threshold INTEGER NOT NULL DEFAULT 3,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public_products (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    view_count INTEGER DEFAULT 0,
    enquiry_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enquiries (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_contact VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(32) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid query performance
CREATE INDEX IF NOT EXISTS idx_products_artisan_id ON products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_product_id ON enquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
