import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Home, Sparkles } from "lucide-react";
import { RotaractLogo, RotaractWordmark } from "@/components/branding/RotaractLogo";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", url: "/", icon: Home },
  { label: "About", url: "/about" },
  { label: "Events", url: "/events" },
  { label: "Blog", url: "/blog" },
  { label: "Team", url: "/team" },
  { label: "Contact", url: "/contact" },
];

export function NavItemLink({
  url,
  label,
  icon: Icon,
  onClick,
  className = "",
}: {
  url: string;
  label: string;
  icon?: any;
  onClick?: () => void;
  className?: string;
}) {
  const base =
    "relative flex items-center gap-2 rounded-full px-4 py-2 font-sans text-[0.85rem] font-medium transition-colors";

  if (!url.startsWith("/")) {
    return (
      <a href={url} onClick={onClick} className={`${base} text-muted-foreground hover:text-white ${className}`}>
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </a>
    );
  }
  return (
    <Link
      to={url as never}
      onClick={onClick}
      className={`${base} ${className}`}
      activeOptions={{ exact: url === "/" }}
      activeProps={{ className: "text-white" }}
      inactiveProps={{ className: "text-white/50 hover:text-white" }}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 py-4 transition-all duration-300">
      <nav
        className="mx-auto flex max-w-[90rem] items-center justify-between px-6"
        aria-label="Primary"
      >
        <Link to="/" className="flex items-center gap-3">
          <RotaractLogo className="h-9 w-9" />
          <RotaractWordmark />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center">
            {NAV_LINKS.map((item) => (
              <NavItemLink key={item.url} url={item.url} label={item.label} icon={item.icon} />
            ))}
          </div>
          
          <Link
            className="ml-2 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            <Sparkles className="h-4 w-4" />
            <span>Join Club</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative z-50 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black text-white lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div 
            className="fixed inset-0 -z-10 bg-black lg:hidden flex flex-col justify-center items-center"
            initial={{ opacity: 0, clipPath: "circle(0% at 90% 10%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 90% 10%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 90% 10%)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="flex flex-col gap-8 text-center mt-12">
              {NAV_LINKS.map((item, i) => (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.05 }}
                >
                  <NavItemLink
                    url={item.url}
                    label={item.label}
                    onClick={() => setOpen(false)}
                    className="text-2xl font-bold tracking-[0.2em] text-white hover:text-primary transition-colors"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
