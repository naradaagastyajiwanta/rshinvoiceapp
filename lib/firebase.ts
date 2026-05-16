import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updatePassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  type Auth,
  type User,
} from "firebase/auth"
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
)

let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null

function getApp(): FirebaseApp | null {
  if (!isConfigured) return null
  if (!_app) {
    _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  }
  return _app
}

export function getFirebaseAuth(): Auth | null {
  if (!isConfigured) return null
  if (!_auth) {
    const app = getApp()
    if (app) _auth = getAuth(app)
  }
  return _auth
}

export function getFirebaseDb(): Firestore | null {
  if (!isConfigured) return null
  if (!_db) {
    const app = getApp()
    if (app) _db = getFirestore(app)
  }
  return _db
}

// Convenience getters (will be null if not configured)
export const auth = {
  get current() { return getFirebaseAuth() },
  get currentUser() { return getFirebaseAuth()?.currentUser ?? null },
}

export const db = {
  get current() { return getFirebaseDb() },
}

function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid login credentials"
    case "auth/email-already-in-use":
      return "User already registered"
    case "auth/weak-password":
      return "Password minimal 6 karakter"
    case "auth/invalid-email":
      return "Format email tidak valid"
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled (operation-not-allowed)"
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti."
    case "auth/network-request-failed":
      return "Failed to fetch"
    case "auth/expired-action-code":
      return "Link reset password sudah kedaluwarsa"
    case "auth/invalid-action-code":
      return "Link reset password tidak valid"
    default:
      return code || "Terjadi kesalahan autentikasi"
  }
}

const NOT_CONFIGURED_ERROR = { message: "Firebase belum dikonfigurasi. Tambahkan environment variables." }

export const authHelpers = {
  signIn: async (email: string, password: string) => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) return { data: { user: null, session: null }, error: NOT_CONFIGURED_ERROR }
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password)
      return { data: { user: cred.user, session: null }, error: null }
    } catch (error: any) {
      return { data: { user: null, session: null }, error: { message: mapFirebaseAuthError(error.code) } }
    }
  },

  signUp: async (email: string, password: string, metadata?: { name?: string }) => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) return { data: { user: null, session: null }, error: NOT_CONFIGURED_ERROR }
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      return { data: { user: cred.user, session: null }, error: null }
    } catch (error: any) {
      return { data: { user: null, session: null }, error: { message: mapFirebaseAuthError(error.code) } }
    }
  },

  signOut: async () => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) return { error: null }
    try {
      await signOut(firebaseAuth)
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  },

  resetPassword: async (email: string) => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) return { data: null, error: NOT_CONFIGURED_ERROR }
    try {
      const actionCodeSettings = {
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
      }
      await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings)
      return { data: {}, error: null }
    } catch (error: any) {
      return { data: null, error: { message: mapFirebaseAuthError(error.code) } }
    }
  },

  confirmPasswordReset: async (oobCode: string, newPassword: string) => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) return { data: null, error: NOT_CONFIGURED_ERROR }
    try {
      await confirmPasswordReset(firebaseAuth, oobCode, newPassword)
      return { data: {}, error: null }
    } catch (error: any) {
      return { data: null, error: { message: mapFirebaseAuthError(error.code) } }
    }
  },

  updatePassword: async (newPassword: string) => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) return { data: null, error: NOT_CONFIGURED_ERROR }
    const user = firebaseAuth.currentUser
    if (!user) return { data: null, error: { message: "User tidak terautentikasi" } }
    try {
      await updatePassword(user, newPassword)
      return { data: {}, error: null }
    } catch (error: any) {
      return { data: null, error: { message: mapFirebaseAuthError(error.code) } }
    }
  },

  signInWithGoogle: async () => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) return { data: { user: null }, error: NOT_CONFIGURED_ERROR }
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(firebaseAuth, provider)
      return { data: { user: cred.user }, error: null }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
        return { data: { user: null }, error: null }
      }
      return { data: { user: null }, error: { message: mapFirebaseAuthError(error.code) } }
    }
  },

  getUser: async () => {
    const firebaseAuth = getFirebaseAuth()
    return { data: { user: firebaseAuth?.currentUser ?? null }, error: null }
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) {
      callback(null)
      return () => {}
    }
    return onAuthStateChanged(firebaseAuth, callback)
  },
}

export { collection, doc, addDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp }
