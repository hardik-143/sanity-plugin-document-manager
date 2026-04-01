"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Database } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ColorThemePicker } from "./ColorThemePicker";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Docs", href: "/docs", type: "docs" },
  { label: "API", href: "/docs/api", type: "api" },
  { label: "Changelog", href: "/docs/changelog", type: "changelog" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function getActiveType() {
    if (pathname?.startsWith("/docs/api")) return "api";
    if (pathname?.startsWith("/docs/changelog")) return "changelog";
    if (pathname?.startsWith("/docs")) return "docs";
    return "";
  }

  const activeType = getActiveType();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Database className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight text-text">
            doc-manager
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.type === activeType;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-1.5 text-[13px] rounded-lg transition-colors",
                  isActive
                    ? "text-primary font-medium bg-primary/8"
                    : "text-text-secondary hover:text-text hover:bg-bg-tertiary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/hardik-143/sanity-plugin-document-manager"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              border border-border text-xs text-text-secondary
              hover:border-primary/40 hover:text-text transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/sanity-plugin-document-manager"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              border border-border text-xs text-text-secondary
              hover:border-primary/40 hover:text-text transition-colors"
          >
            npm
          </a>
          <ColorThemePicker />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-lg border border-border hover:bg-bg-tertiary transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-bg/95 backdrop-blur-xl p-3">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg transition-colors",
                  link.type === activeType
                    ? "text-primary bg-primary/8 font-medium"
                    : "text-text-secondary hover:text-text hover:bg-bg-tertiary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}