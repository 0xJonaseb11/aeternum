import Link from "next/link";
import { AppLogo } from "~~/components/AppLogo";

/**
 * Shared layout for all /team/* routes. Keeps nav consistent and scalable.
 */
export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <header className="border-b border-base-300 bg-base-100/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-8" />
            <span className="font-bold text-sm uppercase tracking-wider">Aeternum</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/team" className="text-xs font-medium text-base-content/70 hover:text-primary">
              Team
            </Link>
            <Link href="/vault" className="text-xs font-medium text-base-content/70 hover:text-primary">
              Vault
            </Link>
            <Link href="/settings" className="text-xs font-medium text-base-content/70 hover:text-primary">
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">{children}</main>
    </div>
  );
}
