import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background/80 border-border sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          <a href="/#features" className="text-muted-foreground hover:text-foreground text-sm">
            Features
          </a>
          <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground text-sm">
            How it works
          </a>
          <Link to="/role" className="text-muted-foreground hover:text-foreground text-sm">
            For institutions
          </Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/role">Get Started</Link>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="size-5" />
        </Button>
      </div>
      {open && (
        <div className="border-border bg-background border-t px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a href="/#features" className="text-sm" onClick={() => setOpen(false)}>
              Features
            </a>
            <a href="/#how-it-works" className="text-sm" onClick={() => setOpen(false)}>
              How it works
            </a>
            <Button variant="outline" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/role">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-border bg-card border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="text-muted-foreground text-sm">
            Learn Smarter. Understand Deeper. Grow Faster.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["Features", "/#features"],
            ["How it works", "/#how-it-works"],
            ["Get started", "/role"],
          ]}
        />
        <FooterCol
          title="For institutions"
          links={[
            ["Register institution", "/register/institution"],
            ["Log in", "/login"],
          ]}
        />
        <FooterCol
          title="Learners"
          links={[
            ["Create account", "/register/learner"],
            ["Log in", "/login"],
          ]}
        />
      </div>
      <div className="border-border text-muted-foreground border-t px-4 py-5 text-center text-xs">
        © {new Date().getFullYear()} Learnexa. AI-powered multimodal learning.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-muted-foreground hover:text-foreground text-sm">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
