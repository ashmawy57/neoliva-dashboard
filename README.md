# Neoliva Dental Clinic Dashboard 🦷

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

A premium, comprehensive Dental Clinic Management System designed for modern dental practices. This dashboard provides a centralized hub for managing patients, appointments, billing, inventory, and clinical data with a focus on speed, security, and exceptional UI/UX.

---

## ✨ Key Features

- **📊 Comprehensive Dashboard**: Real-time analytics and overview of clinic performance.
- **👥 Patient Management**: Detailed electronic medical records, history, and profile management.
- **📅 Appointment Scheduling**: Seamless booking and management of patient visits.
- **💰 Billing & Invoicing**: Automated invoice generation, payment tracking, and financial reporting.
- **🦷 Clinical Tools**: Advanced tooth charting, periodontograms, and oral examination modules.
- **📦 Inventory Tracking**: Real-time monitoring of clinic supplies and stock alerts.
- **🧪 Lab Orders**: Integrated management of dental laboratory requests and status.
- **💸 Expense Management**: Track clinic overheads and operational costs.
- **👨‍⚕️ Staff Management**: Roles, permissions, and staff scheduling.
- **📈 Advanced Reports**: Detailed financial and operational insights.

## 🚀 Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend/Database**: [Supabase](https://supabase.com/), [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- A Supabase account and project
- NPM / PNPM / Bun

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ashmawy57/neoliva-dashboard.git
   cd neoliva-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Supabase credentials (see `.env.example`).
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_prisma_database_url
   DIRECT_URL=your_prisma_direct_url
   ```

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

