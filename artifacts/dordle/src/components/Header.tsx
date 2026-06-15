import { Link } from "wouter";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
}

export default function Header({ title = "Dordle", subtitle, showBack, backHref = "/", backLabel = "Today's Word" }: HeaderProps) {
  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="max-w-[400px] mx-auto px-4 h-14 flex items-center justify-between">
        {showBack ? (
          <Link href={backHref}>
            <button
              data-testid="button-back"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {backLabel}
            </button>
          </Link>
        ) : (
          <div className="w-16" />
        )}

        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground -mt-0.5">{subtitle}</p>
          )}
        </div>

        <Link href="/challenge">
          <button
            data-testid="button-challenge-nav"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors w-16 text-right"
          >
            Play
          </button>
        </Link>
      </div>
    </header>
  );
}
