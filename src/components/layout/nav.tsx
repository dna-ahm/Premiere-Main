import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpeg";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/library", label: "Product Library" },
  { to: "/add", label: "Add Product" },
  { to: "/analytics", label: "Analytics" },
] as const;

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b hairline bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-8 py-5">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Premiere Main" className="h-9 w-auto" />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-serif text-xl">Premiere Main</span>
            <span className="tracking-luxury text-[10px] text-muted-foreground">
              Collection Development
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="tracking-luxury text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <div className="font-serif text-sm leading-tight">Management</div>
            <div className="text-[10px] text-muted-foreground">Atelier · Paris</div>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-[11px] font-medium text-primary-foreground">
            PM
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t hairline">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-8 text-[11px] tracking-luxury text-muted-foreground">
        <span>© Premiere Main — Maison Atelier</span>
        <span>Made for the studio · v0.1</span>
      </div>
    </footer>
  );
}
