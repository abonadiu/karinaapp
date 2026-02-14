import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg font-serif">IQ</span>
            </div>
            <span className="text-xl font-serif font-semibold text-foreground">IQ+IS</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div className="bg-card rounded-2xl shadow-warm-lg border border-border p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 IQ+IS. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
