-- Supabase Database Schema for Mulhim Platform
-- Location: supabase/schema.sql

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    guardian2_name TEXT,
    guardian2_phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CHILDREN TABLE (Linked to Profiles)
CREATE TABLE IF NOT EXISTS public.children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('ذكر', 'أنثى')),
    grade TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Children
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- 3. REGISTRATIONS TABLE (Linked to Profiles & Children - References Sanity content via target_id)
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.children(id) ON DELETE SET NULL, -- Null if registering volunteer or self
    full_name TEXT NOT NULL, -- Full name of registrant (e.g. child name or user name)
    age INTEGER,
    phone TEXT,
    email TEXT,
    interests TEXT[],
    type TEXT NOT NULL CHECK (type IN ('trip', 'academy', 'program', 'volunteer')),
    target_id TEXT NOT NULL, -- Slug or ID of target content in Sanity (Do not duplicate actual product/trip data)
    target_name TEXT NOT NULL, -- Name/Title of target content for quick visual display
    payment_method TEXT, -- Payment option (card, cash, tabby)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 4. ORDERS TABLE (Linked to Profiles for store checkouts)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null if guest checkout
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. ORDER ITEMS TABLE (Linked to Orders - References Sanity product via product_id)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL, -- Slug or ID of product in Sanity (Do not duplicate actual product schema)
    product_name TEXT NOT NULL, -- Product name for receipt reference
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- Enable RLS on Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Contact Messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_child_id ON public.registrations(child_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Helper function to check if the current user is an admin.
-- Using SECURITY DEFINER bypasses RLS policies to prevent infinite recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Allow users to read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Allow admins to view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Allow admins to update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Allow profile creation"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- Children Policies
CREATE POLICY "Allow parents to view their own children"
    ON public.children FOR SELECT
    USING (auth.uid() = parent_id);

CREATE POLICY "Allow parents to insert their own children"
    ON public.children FOR INSERT
    WITH CHECK (auth.uid() = parent_id OR auth.uid() IS NULL);

CREATE POLICY "Allow parents to update their own children"
    ON public.children FOR UPDATE
    USING (auth.uid() = parent_id);

CREATE POLICY "Allow parents to delete their own children"
    ON public.children FOR DELETE
    USING (auth.uid() = parent_id);

CREATE POLICY "Allow admins to manage all children"
    ON public.children FOR ALL
    USING (public.is_admin());

-- Registrations Policies
CREATE POLICY "Allow users to view their own registrations"
    ON public.registrations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own registrations"
    ON public.registrations FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Allow users to update their own registrations"
    ON public.registrations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all registrations"
    ON public.registrations FOR ALL
    USING (public.is_admin());

-- Orders Policies
CREATE POLICY "Allow users to view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow placement of orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow admins to manage all orders"
    ON public.orders FOR ALL
    USING (public.is_admin());

-- Order Items Policies
CREATE POLICY "Allow users to view their own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_id AND (orders.user_id = auth.uid() OR auth.uid() IS NULL)
        )
    );

CREATE POLICY "Allow placement of order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow admins to manage all order items"
    ON public.order_items FOR ALL
    USING (public.is_admin());

-- Contact Messages Policies
CREATE POLICY "Allow creation of contact messages"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow admins to manage all contact messages"
    ON public.contact_messages FOR ALL
    USING (public.is_admin());


-- =========================================================================
-- PROFILE AUTOMATION TRIGGER FROM AUTH.USERS
-- =========================================================================
-- Diagnostic table to capture trigger errors
CREATE TABLE IF NOT EXISTS public.trigger_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    user_email TEXT,
    meta_data JSONB
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        guardian2_name,
        guardian2_phone,
        role
    )
    VALUES (
        new.id,
        COALESCE(
            new.raw_user_meta_data->>'full_name',
            'عضو ملهم الجديد'
        ),
        new.email,
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'guardian2_name',
        new.raw_user_meta_data->>'guardian2_phone',
        'user'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- SCHEMA GRANTS AND PRIVILEGES
-- =========================================================================
-- Grant permissions on schema and existing tables to public API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Ensure future tables, sequences, and functions automatically get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

