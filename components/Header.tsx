"use client";
import WalletButton from "./WalletButton";

export type ViewMode = "institutional" | "retail";

interface Props {
  onViewChange?: (v: ViewMode) => void;
  view?: ViewMode;
}

export default function Header({ onViewChange, view = "institutional" }: Props) {
  const navs = [
    { id: "scanner", label: "Scanner", href: "/", active: true },
    { id: "portfolio", label: "Portfolio", href: "/" },
    { id: "vaults", label: "Vaults", href: "/" },
    { id: "methodology", label: "Methodology", href: "/methodology" },
  ];

  return (
    <header className="if-header">
      <div className="if-header__inner">
        <div className="flex items-center gap-7">
          <a className="if-logo" href="/">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M3 18 L11 4 L19 18"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 13 L11 8 L15 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity=".55"
              />
            </svg>
            <span>
              Invest<span style={{ color: "var(--accent)" }}>Fi</span>
            </span>
          </a>

          <nav className="if-nav">
            {navs.map((n) => (
              <a
                key={n.id}
                href={n.href}
                className="if-nav__item"
                data-active={n.active || undefined}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="if-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input placeholder="Search protocols, chains, assets…" />
            <kbd>⌘K</kbd>
          </div>

          <div className="if-toggle">
            <button
              data-active={view === "institutional" || undefined}
              onClick={() => onViewChange?.("institutional")}
            >
              Pro
            </button>
            <button
              data-active={view === "retail" || undefined}
              onClick={() => onViewChange?.("retail")}
            >
              Simple
            </button>
          </div>

          <WalletButton />
        </div>
      </div>
    </header>
  );
}
