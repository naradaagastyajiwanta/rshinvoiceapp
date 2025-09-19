import { Navbar } from "@/components/navbar"
import { InvoiceGenerator } from "@/components/invoice-generator"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-6 sm:py-12 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold text-green-800 mb-2 sm:mb-3">Rumah Sehat Holistik</h1>
            <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-2 sm:mb-4 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-semibold text-green-700">Invoice Generator</h2>
          </div>
          <InvoiceGenerator />

          <footer className="mt-8 sm:mt-16 text-center text-gray-500 text-xs sm:text-sm">
            <p>© {new Date().getFullYear()} Rumah Sehat Holistik Satu Bumi. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </>
  )
}
