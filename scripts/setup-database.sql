-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_details table
CREATE TABLE IF NOT EXISTS payment_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    invoice_date DATE NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('LUNAS', 'BELUM LUNAS')) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_detail_id UUID REFERENCES payment_details(id),
    user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(15,2) NOT NULL CHECK (price >= 0),
    discount DECIMAL(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_details_user_id ON payment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_details_is_default ON payment_details(is_default);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_detail_id ON invoices(payment_detail_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Insert default payment details
INSERT INTO payment_details (bank_name, account_number, account_name, is_default, user_id) 
VALUES 
    ('BCA', '5050096370', 'Siti Rohmah', true, 'default')
ON CONFLICT DO NOTHING;

-- Insert default products
INSERT INTO products (name, description, price, category, user_id) 
VALUES 
    ('Sehat Dalam Sekejap', 'Program kesehatan cepat dan efektif', 300000, 'Konsultasi', 'default'),
    ('Quantum Scan', 'Pemeriksaan kesehatan dengan teknologi quantum', 180000, 'Pemeriksaan', 'default'),
    ('Program 7 Hari Menuju Sehat Raga & Jiwa', 'Program holistik 7 hari untuk kesehatan optimal', 6300000, 'Program', 'default'),
    ('Konsultasi Kesehatan', 'Konsultasi langsung dengan ahli kesehatan', 250000, 'Konsultasi', 'default'),
    ('Terapi Holistik', 'Terapi kesehatan secara menyeluruh', 350000, 'Terapi', 'default'),
    ('Paket Detox', 'Program detoksifikasi tubuh alami', 500000, 'Program', 'default'),
    ('Herbal Treatment', 'Pengobatan dengan ramuan herbal alami', 275000, 'Terapi', 'default')
ON CONFLICT DO NOTHING;

-- Insert sample data for testing
INSERT INTO invoices (invoice_number, client_name, invoice_date, payment_status, total_amount, user_id) 
VALUES 
    ('INV-20241213-0001', 'John Doe', '2024-12-13', 'LUNAS', 500000, 'Lily'),
    ('INV-20241213-0002', 'Jane Smith', '2024-12-13', 'BELUM LUNAS', 750000, 'Lily')
ON CONFLICT (invoice_number) DO NOTHING;

-- Insert sample invoice items
WITH sample_invoices AS (
    SELECT id, invoice_number FROM invoices WHERE invoice_number IN ('INV-20241213-0001', 'INV-20241213-0002')
)
INSERT INTO invoice_items (invoice_id, description, quantity, price, discount)
SELECT 
    si.id,
    CASE 
        WHEN si.invoice_number = 'INV-20241213-0001' THEN 'Sehat Dalam Sekejap'
        ELSE 'Quantum Scan'
    END,
    1,
    CASE 
        WHEN si.invoice_number = 'INV-20241213-0001' THEN 300000
        ELSE 180000
    END,
    0
FROM sample_invoices si
ON CONFLICT DO NOTHING;
