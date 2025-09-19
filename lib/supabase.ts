import { createClient } from "@supabase/supabase-js"

// Pastikan URL dan kunci API tersedia
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Log environment variables untuk debugging (tanpa expose key)
console.log("Supabase Configuration:", {
  hasUrl: !!supabaseUrl,
  urlValid: supabaseUrl.startsWith("https://"),
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "NOT_SET",
})

// Singleton pattern untuk client-side Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  // Jika tidak ada konfigurasi yang valid, return mock client
  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith("https://")) {
    console.warn("Supabase not properly configured, returning mock client")
    return createMockSupabaseClient()
  }

  if (!supabaseClient) {
    console.log("Creating new Supabase client")
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true, // Enable session persistence for auth
          autoRefreshToken: true, // Enable auto refresh for auth
          detectSessionInUrl: true, // Detect session in URL for email confirmations
        },
        global: {
          fetch: async (...args) => {
            try {
              // Add timeout to fetch requests
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

              const response = await fetch(args[0], {
                ...args[1],
                signal: controller.signal,
              })

              clearTimeout(timeoutId)
              return response
            } catch (error: any) {
              console.error("Supabase fetch error:", error.message)

              // Throw more specific errors
              if (error.name === "AbortError") {
                throw new Error("Request timeout - please check your internet connection")
              } else if (error.message.includes("Failed to fetch")) {
                throw new Error("Network error - unable to connect to database server")
              } else {
                throw new Error(`Connection failed: ${error.message}`)
              }
            }
          },
        },
        db: {
          schema: "public",
        },
      })
    } catch (error: any) {
      console.error("Failed to create Supabase client:", error)
      return createMockSupabaseClient()
    }
  }
  return supabaseClient
}

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith("https://")) {
    console.warn("Supabase not properly configured for server, returning mock client")
    return createMockSupabaseClient()
  }

  console.log("Creating server Supabase client")

  try {
    return createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: async (...args) => {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for server

            const response = await fetch(args[0], {
              ...args[1],
              signal: controller.signal,
            })

            clearTimeout(timeoutId)
            return response
          } catch (error: any) {
            console.error("Supabase server fetch error:", error.message)

            if (error.name === "AbortError") {
              throw new Error("Server request timeout")
            } else if (error.message.includes("Failed to fetch")) {
              throw new Error("Server network error")
            } else {
              throw new Error(`Server connection failed: ${error.message}`)
            }
          }
        },
      },
      db: {
        schema: "public",
      },
    })
  } catch (error: any) {
    console.error("Failed to create server Supabase client:", error)
    return createMockSupabaseClient()
  }
}

// Mock Supabase client untuk fallback
function createMockSupabaseClient() {
  return {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: null, error: { message: "Database not available - using offline mode" } }),
      insert: () => Promise.resolve({ data: null, error: { message: "Database not available - using offline mode" } }),
      update: () => Promise.resolve({ data: null, error: { message: "Database not available - using offline mode" } }),
      delete: () => Promise.resolve({ data: null, error: { message: "Database not available - using offline mode" } }),
      upsert: () => Promise.resolve({ data: null, error: { message: "Database not available - using offline mode" } }),
    }),
    auth: {
      signInWithPassword: () =>
        Promise.resolve({
          data: { user: null, session: null },
          error: { message: "Auth not available - using offline mode" },
        }),
      signUp: () =>
        Promise.resolve({
          data: { user: null, session: null },
          error: { message: "Auth not available - using offline mode" },
        }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () =>
        Promise.resolve({ data: {}, error: { message: "Auth not available - using offline mode" } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    rpc: () => Promise.resolve({ data: null, error: { message: "Database not available - using offline mode" } }),
  } as any
}

// Authentication helper functions
export const authHelpers = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, metadata?: any) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Reset password
  resetPassword: async (email: string) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  // Update password
  updatePassword: async (password: string) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
    return { data, error }
  },

  // Get current session
  getSession: async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  // Get current user
  getUser: async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },
}

// Fungsi untuk test koneksi dengan timeout
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    // Check environment variables first
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        message: "Supabase environment variables not configured",
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
        },
      }
    }

    if (!supabaseUrl.startsWith("https://")) {
      return {
        success: false,
        message: "Invalid Supabase URL format",
        details: { url: supabaseUrl },
      }
    }

    const supabase = getSupabaseClient()

    // Test with a simple query and timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection test timeout")), 8000),
    )

    const testPromise = supabase.from("invoices").select("count").limit(1)

    const result = (await Promise.race([testPromise, timeoutPromise])) as any

    if (result.error) {
      return {
        success: false,
        message: `Database query failed: ${result.error.message}`,
        details: result.error,
      }
    }

    return {
      success: true,
      message: "Connection successful",
      details: { recordCount: result.data?.length || 0 },
    }
  } catch (error: any) {
    let message = "Connection test failed"

    if (error.message.includes("timeout")) {
      message = "Connection timeout - please check your internet connection"
    } else if (error.message.includes("Network error")) {
      message = "Network error - unable to reach database server"
    } else if (error.message.includes("CORS")) {
      message = "CORS error - please check domain configuration"
    } else if (error.message.includes("401")) {
      message = "Authentication error - please check API keys"
    } else if (error.message.includes("404")) {
      message = "Database not found - please check Supabase URL"
    }

    return {
      success: false,
      message,
      details: { error: error.message },
    }
  }
}
