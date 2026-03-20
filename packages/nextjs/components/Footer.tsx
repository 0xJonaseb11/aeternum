import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { AppLogo } from "~~/components/AppLogo";
import { SwitchTheme } from "~~/components/SwitchTheme";

const FOOTER_LINKS = {
  product: [
    { href: "/", label: "Home" },
    { href: "/vault", label: "Vault" },
    { href: "/plans", label: "Pricing" },
    { href: "/verify", label: "Verify" },
  ],
  resources: [
    { href: "/billing", label: "Billing" },
    { href: "/settings/api-keys", label: "API Tools" },
    { href: "/docs", label: "Documentation" },
    { href: "/help", label: "Help Center" },
    { href: "/status", label: "Status" },
    { href: "/settings", label: "Settings" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/privacy-policy", label: "Privacy" },
    { href: "/tos", label: "Terms" },
  ],
  community: [
    { href: "#", label: "Twitter / X", external: true },
    { href: "#", label: "Discord", external: true },
    { href: "https://github.com/0xJonaseb11/aeternum", label: "GitHub", external: true },
  ],
} as const;

export const Footer = () => {
  const { address } = useAccount();

  const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").toLowerCase().split(",").filter(Boolean);
  const isAdmin = address && adminWallets.includes(address.toLowerCase());

  const companyLinks = [...FOOTER_LINKS.company];
  if (isAdmin) {
    companyLinks.push({ href: "/admin", label: "Admin" } as any);
  }

  return (
    <footer className="mt-auto border-t border-base-300 bg-base-100/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full min-w-0">
      <div className="mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <AppLogo className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" />
              <span className="font-bold text-lg sm:text-xl tracking-tight text-base-content">Aeternum</span>
            </div>
            <p className="max-w-xs text-xs sm:text-sm text-base-content/60 leading-relaxed">
              Secure, permanent, and private evidence vault. Leveraging zero-knowledge proofs and decentralized storage.
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-base-content/40 mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.product.map(({ href, label }) => (
                <li key={href + label}>
                  <Link href={href} className="link link-hover text-base-content/70">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-base-content/40 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.resources.map(({ href, label }) => (
                <li key={href + label}>
                  <Link href={href} className="link link-hover text-base-content/70">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-base-content/40 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {companyLinks.map(({ href, label }) => (
                <li key={href + label}>
                  <Link href={href} className="link link-hover text-base-content/70">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-base-content/40 mb-4">Connect</h3>
            <ul className="space-y-2 text-sm text-base-content/70">
              {FOOTER_LINKS.community.map(({ href, label, external }) => (
                <li key={href + label}>
                  {external ? (
                    <a href={href} target="_blank" rel="noreferrer" className="link link-hover">
                      {label}
                    </a>
                  ) : (
                    <Link href={href} className="link link-hover">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] sm:text-xs text-base-content/40 text-center md:text-left max-w-full">
            © {new Date().getFullYear()} Aeternum. Built for the future of evidence.
          </p>
          <div className="flex items-center gap-4">
            <SwitchTheme />
          </div>
        </div>
      </div>

      <Link
        href="https://github.com/0xJonaseb11"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-2 right-4 z-50 group flex items-center gap-2 bg-primary border border-base-content/10 px-3 py-1.5 rounded-full hover:bg-base-100 transition-all duration-500 shadow-xl shadow-primary/20 scale-90 sm:scale-100 origin-right"
      >
        <div className="flex flex-col items-end leading-none">
          <span className="text-[10px] text-primary-content/60 group-hover:text-base-content/60 transition-colors uppercase tracking-widest font-bold">
            Built by
          </span>
          <span className="text-xs text-primary-content group-hover:text-base-content font-bold transition-colors">
            Jonas Sebera
          </span>
        </div>
        <div className="bg-primary-content/10 group-hover:bg-primary p-1 rounded-full transition-colors">
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3 fill-primary-content group-hover:fill-primary-content transition-colors"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </div>
      </Link>
    </footer>
  );
};
