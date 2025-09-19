# 🧾 RSH Invoice App

> Modern Invoice Management System built with Next.js and Supabase

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## ✨ Features

### 🔐 Authentication System
- **User Registration & Login** - Secure user authentication
- **Password Reset** - Forgot password functionality  
- **Session Management** - Persistent login sessions

### 📋 Invoice Management
- **Create Invoices** - Professional invoice generation
- **Invoice Preview** - Real-time preview before saving
- **PDF Export** - Generate downloadable PDF invoices
- **Invoice History** - View all past invoices
- **Dynamic Pricing** - Automatic calculations

### 🎨 Modern UI/UX
- **Responsive Design** - Works on all devices
- **Dark/Light Theme** - Toggle between themes
- **Component Library** - Reusable UI components
- **Loading States** - Smooth user experience
- **Toast Notifications** - User feedback system

### 🗄️ Database Features
- **Supabase Integration** - Real-time database
- **Database Diagnostics** - Health monitoring
- **Auto Setup** - Database initialization
- **Data Validation** - Input sanitization

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **State Management**: React hooks
- **PDF Generation**: Built-in PDF export

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **File Storage**: Supabase Storage

### Development Tools
- **Package Manager**: Bun/npm
- **Code Quality**: TypeScript strict mode
- **Styling**: PostCSS, Tailwind CSS
- **Build Tool**: Next.js built-in bundler

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/naradaagastyajiwanta/rshinvoiceapp.git
   cd rshinvoiceapp
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install --legacy-peer-deps
   
   # Or using bun
   bun install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=your_database_url
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Setup database**
   - Run the setup script in `scripts/setup-database.sql` in your Supabase SQL editor
   - Or use the built-in setup API endpoint

5. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
rshinvoice/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── login/                    # Authentication pages
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── invoice/[id]/             # Dynamic invoice pages
│   ├── history/                  # Invoice history
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── ui/                       # UI component library
│   ├── auth-provider.tsx
│   ├── invoice-form.tsx
│   ├── invoice-generator.tsx
│   └── ...
├── lib/                          # Utility functions
│   ├── supabase.ts              # Supabase client
│   ├── types.ts                 # TypeScript types
│   ├── utils.ts                 # Helper functions
│   └── ...
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
├── scripts/                      # Database scripts
└── styles/                       # Additional styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | Random string for session encryption | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL script from `scripts/setup-database.sql`
3. Configure Row Level Security (RLS) policies
4. Get your API keys from the Supabase dashboard

## 📊 Database Schema

The application uses the following main tables:
- `users` - User authentication and profiles
- `invoices` - Invoice data and metadata
- `invoice_items` - Individual invoice line items
- `products` - Product catalog
- `customers` - Customer information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components

## 📞 Support

If you have any questions or need help with setup, please open an issue or reach out to the maintainers.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/naradaagastyajiwanta">Narada Agastya Jiwanta</a></sub>
</div>