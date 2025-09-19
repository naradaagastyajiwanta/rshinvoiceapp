import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("Starting database setup...")

    const supabase = createServerSupabaseClient()

    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .limit(1)

    if (testError) {
      console.error("Database connection test failed:", testError)
      return NextResponse.json(
        {
          success: false,
          error: `Database connection failed: ${testError.message}`,
          details: testError,
        },
        { status: 500 },
      )
    }

    // Create invoices table using raw SQL
    const createInvoicesSQL = `
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        invoice_date DATE NOT NULL,
        payment_status VARCHAR(20) CHECK (payment_status IN ('LUNAS', 'BELUM LUNAS')) NOT NULL,
        total_amount DECIMAL(15,2) NOT NULL,
        user_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: invoicesError } = await supabase.rpc("exec_sql", {
      sql: createInvoicesSQL,
    })

    if (invoicesError) {
      console.error("Error creating invoices table:", invoicesError)
      // Continue anyway, table might already exist
    }

    // Create invoice_items table
    const createItemsSQL = `
      CREATE TABLE IF NOT EXISTS invoice_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price DECIMAL(15,2) NOT NULL CHECK (price >= 0),
        discount DECIMAL(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: itemsError } = await supabase.rpc("exec_sql", {
      sql: createItemsSQL,
    })

    if (itemsError) {
      console.error("Error creating invoice_items table:", itemsError)
      // Continue anyway
    }

    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
      CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON invoices(client_name);
      CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
    `

    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql: createIndexesSQL,
    })

    if (indexError) {
      console.error("Error creating indexes:", indexError)
      // Continue anyway
    }

    // Insert sample data
    const { error: sampleError } = await supabase.from("invoices").upsert(
      [
        {
          invoice_number: "INV-20241213-0001",
          client_name: "John Doe",
          invoice_date: "2024-12-13",
          payment_status: "LUNAS",
          total_amount: 500000,
          user_id: "Lily",
        },
        {
          invoice_number: "INV-20241213-0002",
          client_name: "Jane Smith",
          invoice_date: "2024-12-13",
          payment_status: "BELUM LUNAS",
          total_amount: 750000,
          user_id: "Lily",
        },
      ],
      { onConflict: "invoice_number" },
    )

    if (sampleError) {
      console.error("Error inserting sample data:", sampleError)
      // This is not critical, continue
    }

    console.log("Database setup completed successfully")

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      details: {
        tablesCreated: !invoicesError && !itemsError,
        indexesCreated: !indexError,
        sampleDataInserted: !sampleError,
      },
    })
  } catch (error: any) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Setup failed: ${error.message}`,
        details: error,
      },
      { status: 500 },
    )
  }
}
