import { Link } from "react-router-dom";
import { BrandSymbol } from "@/components/site/BrandSymbol";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2E9E4]">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto">
          <Link to="/" className="inline-flex items-center gap-3">
            <BrandSymbol size={36} color="#335072" />
            <span
              className="text-[#335072] text-lg tracking-[0.2em] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              KARINA BONADIU
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1
              className="text-3xl md:text-4xl text-[#335072] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-[#335072]/60" style={{ fontFamily: "'Roboto', sans-serif" }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-warm-lg border border-[#D4BCB2]/30 p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-[#335072]/50" style={{ fontFamily: "'Roboto', sans-serif" }}>
        <p>&copy; {new Date().getFullYear()} Karina Bonadiu. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
