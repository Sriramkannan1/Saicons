import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

export function CustomCursor() {
  const cursorRef = useRef<HTMLImageElement>(null);
  const location = useRouterState({ select: (s) => s.location });
  const isAdmin = location.pathname.startsWith("/admin");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      document.body.style.cursor = "auto";
      setIsVisible(false);
      return;
    }

    // Hide default cursor
    document.body.style.cursor = "none";
    setIsVisible(true);

    const updatePosition = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Center the cursor or put it at top-left
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    window.addEventListener("mousemove", updatePosition, { passive: true });

    // Handle interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, select, textarea, [role="button"]')) {
        if (cursorRef.current) cursorRef.current.style.transform += ' scale(1.1)';
      }
    };
    
    const handleMouseOut = () => {
      // Re-apply translation on next mousemove to remove scale
    };

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      document.body.style.cursor = "auto";
    };
  }, [isAdmin]);

  if (isAdmin || !isVisible) return null;

  return (
    <img
      ref={cursorRef}
      src="/rotaract-cursor.png"
      alt=""
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[99999]"
      style={{
        // Put pointer at the top-left of the image
        transformOrigin: "0 0",
        willChange: "transform",
      }}
    />
  );
}
