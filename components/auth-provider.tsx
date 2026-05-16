"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getFirebaseAuth, getFirebaseDb, authHelpers, getDoc, doc } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: true,
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) {
      setIsLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const isGoogleUser = firebaseUser.providerData.some((p) => p.providerId === "google.com")
          if (isGoogleUser) {
            const db = getFirebaseDb()
            const email = firebaseUser.email
            if (db && email) {
              const snap = await getDoc(doc(db, "allowed_users", email))
              if (!snap.exists()) {
                await authHelpers.signOut()
                setUser(null)
                setIsLoading(false)
                return
              }
            }
          }
        }
        setUser(firebaseUser)
      } catch {
        await authHelpers.signOut()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const isLoggedIn = !!user
      const isAuthPage =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password"

      if (!isLoggedIn && !isAuthPage) {
        router.push("/login")
      } else if (isLoggedIn && isAuthPage) {
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  const logout = async () => {
    try {
      await authHelpers.signOut()
    } catch (error) {
      console.error("Error in logout:", error)
    } finally {
      setUser(null)
      router.push("/login")
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
