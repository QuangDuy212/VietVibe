import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

export function ScrollToTopButton() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  // Reset scroll of window when route changes
  useEffect(() => {
    if (!pathname.startsWith("/admin")) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // Monitor window scroll position
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 150);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Admin has its own inner-div scrolling container ref and button
  if (pathname.startsWith("/admin")) {
    return null;
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full shadow-lg bg-primary hover:bg-primary/95 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-0 cursor-pointer animate-in fade-in slide-in-from-bottom-5"
      title="Cuộn lên đầu trang"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
