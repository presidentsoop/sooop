# SOOOP - Society of Optometrists, Orthoptists & Ophthalmic Technologists Pakistan

Official website for the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan (SOOOP).

## 🚀 Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **Supabase** - Authentication & Database
- **@supabase/ssr** - Server-side rendering support

## 📋 Features

### Public Pages
- **Home** - Hero section with leadership, image slider, about preview
- **Membership** - Benefits, pricing, registration
- **Events** - Upcoming and past events
- **Cabinet** - Leadership structure, previous presidents, nomination fees
- **Contact** - Contact form and information
- **About** - Organization history, mission, values

### Protected Pages (Dashboard)
- **Overview** - Membership stats and activity
- **Profile** - Update user information
- **Membership** - View membership details and renew
- **Documents** - Access and download documents

## 🎨 Design System

### Brand Colors
- **Primary (Navy)**: `#001F54` - Main brand color
- **Accent (Teal)**: `#00A8CC` - Highlights and CTAs
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

### Typography
- **Headings**: Poppins (bold, 400-700)
- **Body**: Inter (400-600)

### Components
All components use consistent design tokens:
- `.btn` - Buttons with variants (primary, accent, outline, ghost)
- `.card` - Cards with elevation and hover effects
- `.input`, `.select`, `.textarea` - Form controls
- `.badge` - Status indicators

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd membership
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Get these values from your [Supabase Dashboard](https://app.supabase.com):
- Go to Project Settings → API
- Copy the Project URL and anon/public key

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)           # Public routes
│   │   ├── page.tsx       # Home
│   │   ├── about/
│   │   ├── membership/
│   │   ├── events/
│   │   ├── cabinet/
│   │   └── contact/
│   ├── dashboard/         # Protected routes
│   │   ├── page.tsx       # Dashboard home
│   │   ├── profile/
│   │   ├── membership/
│   │   └── documents/
│   ├── login/
│   ├── signup/
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── layout/            # Header, Footer
│   ├── home/              # Home page sections
│   └── dashboard/         # Dashboard components
├── lib/
│   └── supabase/          # Supabase clients
│       ├── client.ts      # Browser client
│       └── server.ts      # Server client
└── proxy.ts               # Auth middleware

public/
├── logo.png
├── favicon.ico
├── slider/                # Image slider assets
├── *.jpg                  # Leadership photos
└── *.pdf                  # Documents
```

## 🔐 Authentication

This project uses Supabase Auth with SSR:

- **Browser Client**: `src/lib/supabase/client.ts`
- **Server Client**: `src/lib/supabase/server.ts`
- **Proxy**: `src/proxy.ts` - Protects `/dashboard/*` routes

### Protected Routes
Only `/dashboard/*` routes require authentication. Public routes are accessible to everyone.

## 🗄️ Database Setup

The project requires the following Supabase tables (create via SQL Editor):

```sql
-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  phone text,
  address text,
  membership_type text check (membership_type in ('student', 'full', 'overseas')),
  membership_status text check (membership_status in ('pending', 'active', 'expired', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  role text check (role in ('member', 'admin', 'super_admin')) default 'member'
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

## 📝 Customization

### Updating Brand Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: '#001F54', // Change this
    // ...
  },
  accent: {
    DEFAULT: '#00A8CC', // And this
    // ...
  },
}
```

### Adding New Pages
1. Create file in `src/app/[page-name]/page.tsx`
2. Add to navigation in `src/components/layout/Header.tsx`
3. Update footer links in `src/components/layout/Footer.tsx`

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Go to [Vercel](https://vercel.com)
- Import your repository
- Add environment variables
- Deploy!

3. **Set up custom domain** (optional)
- Go to Project Settings → Domains
- Add your domain

### Environment Variables on Vercel
Add these in Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 📦 Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

SOOOP - Society of Optometrists, Orthoptists & Ophthalmic Technologists Pakistan

- **Email**: info@sooopvision.com
- **Phone**: +92-332-4513876
- **Address**: SOOOP House, COAVS, KEMU, Lahore, Pakistan

---

Built with ❤️ for the vision care community in Pakistan
