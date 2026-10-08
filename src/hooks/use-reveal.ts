import { useEffect, useRef, useState } from "react";

// Fades a section in the first time it scrolls into view. The timeout is a fallback for
// browsers or crawlers where the observer never fires, so no section stays hidden.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    const fallback = setTimeout(() => setVisible(true), 3000);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return { ref, className: visible ? "reveal reveal-visible" : "reveal" };
}
