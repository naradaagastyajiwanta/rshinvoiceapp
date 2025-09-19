import { getSupabaseClient, testSupabaseConnection } from "./supabase"

export interface DiagnosticResult {
  test: string
  status: "success" | "error" | "warning" | "offline"
  message: string
  details?: any
  canContinue?: boolean
}

export async function runDatabaseDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = []

  // Test 1: Environment Variables
  results.push(await testEnvironmentVariables())

  // Test 2: Network Connectivity
  results.push(await testNetworkConnectivity())

  // Test 3: Client Connection
  results.push(await testClientConnection())

  // Test 4: Database Tables (only if connection works)
  const connectionResult = results.find((r) => r.test === "Client Connection")
  if (connectionResult?.status === "success") {
    results.push(await testDatabaseTables())
    results.push(await testSampleQuery())
  } else {
    results.push({
      test: "Database Tables",
      status: "offline",
      message: "Skipped - no database connection",
      canContinue: true,
    })
    results.push({
      test: "Sample Query",
      status: "offline",
      message: "Skipped - no database connection",
      canContinue: true,
    })
  }

  return results
}

async function testEnvironmentVariables(): Promise<DiagnosticResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        test: "Environment Variables",
        status: "error",
        message: "Supabase environment variables tidak ditemukan",
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          help: "Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diset",
        },
        canContinue: false,
      }
    }

    if (!supabaseUrl.startsWith("https://")) {
      return {
        test: "Environment Variables",
        status: "error",
        message: "Supabase URL tidak valid",
        details: {
          url: supabaseUrl,
          help: "URL harus dimulai dengan https://",
        },
        canContinue: false,
      }
    }

    return {
      test: "Environment Variables",
      status: "success",
      message: "Environment variables tersedia dan valid",
      details: {
        url: `${supabaseUrl.substring(0, 30)}...`,
        hasAnonKey: true,
      },
      canContinue: true,
    }
  } catch (error: any) {
    return {
      test: "Environment Variables",
      status: "error",
      message: `Error checking environment variables: ${error.message}`,
      canContinue: false,
    }
  }
}

async function testNetworkConnectivity(): Promise<DiagnosticResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      return {
        test: "Network Connectivity",
        status: "error",
        message: "Cannot test - no Supabase URL configured",
        canContinue: false,
      }
    }

    // Extract base URL for ping test
    const baseUrl = new URL(supabaseUrl).origin

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${baseUrl}/rest/v1/`, {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok || response.status === 401) {
      // 401 is expected without auth
      return {
        test: "Network Connectivity",
        status: "success",
        message: "Network connection to Supabase successful",
        details: { status: response.status },
        canContinue: true,
      }
    } else {
      return {
        test: "Network Connectivity",
        status: "warning",
        message: `Network reachable but got status ${response.status}`,
        details: { status: response.status },
        canContinue: true,
      }
    }
  } catch (error: any) {
    let message = "Network connectivity test failed"
    let status: "error" | "warning" = "error"

    if (error.name === "AbortError") {
      message = "Network timeout - slow or no internet connection"
      status = "warning"
    } else if (error.message.includes("Failed to fetch")) {
      message = "Cannot reach Supabase servers - check internet connection"
      status = "warning"
    } else if (error.message.includes("CORS")) {
      message = "CORS error - domain not configured in Supabase"
    }

    return {
      test: "Network Connectivity",
      status,
      message,
      details: { error: error.message },
      canContinue: status === "warning",
    }
  }
}

async function testClientConnection(): Promise<DiagnosticResult> {
  try {
    const result = await testSupabaseConnection()

    if (result.success) {
      return {
        test: "Client Connection",
        status: "success",
        message: result.message,
        details: result.details,
        canContinue: true,
      }
    } else {
      // Determine if this is a recoverable error
      const canContinue =
        result.message.includes("timeout") ||
        result.message.includes("Network error") ||
        result.message.includes("not available")

      return {
        test: "Client Connection",
        status: canContinue ? "warning" : "error",
        message: result.message,
        details: result.details,
        canContinue,
      }
    }
  } catch (error: any) {
    return {
      test: "Client Connection",
      status: "warning",
      message: `Connection test failed: ${error.message}`,
      details: { error: error.message },
      canContinue: true,
    }
  }
}

async function testDatabaseTables(): Promise<DiagnosticResult> {
  try {
    const supabase = getSupabaseClient()

    // Test apakah tabel invoices ada
    const { data: invoicesData, error: invoicesError } = await supabase.from("invoices").select("id").limit(1)

    if (invoicesError) {
      if (invoicesError.message.includes("not available")) {
        return {
          test: "Database Tables",
          status: "offline",
          message: "Database offline - using local storage",
          canContinue: true,
        }
      }

      if (invoicesError.code === "42P01" || invoicesError.message.includes("does not exist")) {
        return {
          test: "Database Tables",
          status: "error",
          message: "Tabel 'invoices' tidak ditemukan - database perlu di-setup",
          details: { error: invoicesError },
          canContinue: false,
        }
      }
      throw invoicesError
    }

    // Test apakah tabel invoice_items ada
    const { data: itemsData, error: itemsError } = await supabase.from("invoice_items").select("id").limit(1)

    if (itemsError) {
      if (itemsError.code === "42P01" || itemsError.message.includes("does not exist")) {
        return {
          test: "Database Tables",
          status: "error",
          message: "Tabel 'invoice_items' tidak ditemukan - database perlu di-setup",
          details: { error: itemsError },
          canContinue: false,
        }
      }
      throw itemsError
    }

    return {
      test: "Database Tables",
      status: "success",
      message: "Semua tabel database tersedia",
      canContinue: true,
    }
  } catch (error: any) {
    return {
      test: "Database Tables",
      status: "warning",
      message: `Error checking database tables: ${error.message}`,
      details: { error: error.message },
      canContinue: true,
    }
  }
}

async function testSampleQuery(): Promise<DiagnosticResult> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("invoices").select("id, invoice_number, client_name").limit(5)

    if (error) {
      if (error.message.includes("not available")) {
        return {
          test: "Sample Query",
          status: "offline",
          message: "Database offline - using local storage",
          canContinue: true,
        }
      }
      throw error
    }

    return {
      test: "Sample Query",
      status: "success",
      message: `Berhasil mengambil ${data?.length || 0} record dari database`,
      details: { recordCount: data?.length || 0 },
      canContinue: true,
    }
  } catch (error: any) {
    return {
      test: "Sample Query",
      status: "warning",
      message: `Error executing sample query: ${error.message}`,
      details: { error: error.message },
      canContinue: true,
    }
  }
}

export async function setupDatabase(): Promise<DiagnosticResult> {
  try {
    // Check if we can even attempt setup
    const envTest = await testEnvironmentVariables()
    if (envTest.status === "error") {
      return {
        test: "Database Setup",
        status: "error",
        message: "Cannot setup database - environment variables not configured",
        details: envTest.details,
      }
    }

    const networkTest = await testNetworkConnectivity()
    if (networkTest.status === "error") {
      return {
        test: "Database Setup",
        status: "error",
        message: "Cannot setup database - no network connectivity",
        details: networkTest.details,
      }
    }

    // Try to setup via API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch("/api/setup-database", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.success) {
      return {
        test: "Database Setup",
        status: "success",
        message: "Database berhasil di-setup",
        details: result,
      }
    } else {
      return {
        test: "Database Setup",
        status: "error",
        message: result.error || "Gagal setup database",
        details: result,
      }
    }
  } catch (error: any) {
    let message = `Error setting up database: ${error.message}`

    if (error.name === "AbortError") {
      message = "Database setup timeout - please try again"
    } else if (error.message.includes("Failed to fetch")) {
      message = "Cannot reach setup API - check network connection"
    }

    return {
      test: "Database Setup",
      status: "error",
      message,
      details: { error: error.message },
    }
  }
}
