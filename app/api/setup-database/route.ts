import { NextResponse } from "next/server"

// Firebase/Firestore tidak memerlukan setup database manual seperti SQL.
// Koleksi Firestore dibuat otomatis saat data pertama kali ditulis.
export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Firebase Firestore tidak memerlukan setup manual. Koleksi dibuat otomatis.",
  })
}
