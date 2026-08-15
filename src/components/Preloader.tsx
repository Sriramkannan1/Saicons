import { useEffect, useState } from "react";
import { RotaractLogo } from "@/components/branding/RotaractLogo";

const SESSION_KEY = "rcsc-preloader-shown";

/**
 * Cinematic loading state. Shown once per browser session and never blocks
 * interaction for longer than ~2s.
 */
export function Preloader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
    document.body.style.overflow = "hidden";

    const tick = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.random() * 22));
    }, 180);

    const done = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setVisible(false);
      document.body.style.overflow = "";
    }, 2100);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black transition-opacity duration-500"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="animate-spin" style={{ animationDuration: "3s" }}>
          <RotaractLogo className="h-20 w-20 opacity-90" />
        </div>
        <p className="mt-8 font-display text-[0.65rem] tracking-[0.4em] text-white/50 uppercase">
          Welcome to
        </p>
        <h1 className="mt-3 font-display text-xl font-bold sm:text-3xl text-white">
          ROTARACT CLUB OF
          <span className="block text-white/70">SAIBABA COLONY</span>
        </h1>
        <p className="mt-4 font-display text-[0.6rem] tracking-[0.4em] text-white/40 uppercase">
          Service • Leadership • Fellowship
        </p>
        <div className="mt-8 h-px w-56 overflow-hidden bg-white/10 sm:w-72">
          <div
            className="h-full bg-white transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 font-display text-[0.6rem] tracking-[0.35em] text-white/30 uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}
