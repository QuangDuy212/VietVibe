import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Lesson from "./pages/Lesson";
import LessonDetail from "./pages/LessonDetail";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { useAppDispatch, useAppSelector } from "./redux/hook";
import { fetchAccount } from "./redux/slice/accountSlide";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);

  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    dispatch(fetchAccount())

    let oldRefreshToken: unknown = null;
    const getCookieValue = (name: string) => {
      const cookies = document.cookie.split("; ");
      for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
      }
      return null;
    };
    const interval = setInterval(() => {
      if (window.location.pathname === "/" ) {
        const refreshToken = getCookieValue("refresh_token");
        if (oldRefreshToken !== null && refreshToken !== oldRefreshToken) {
          console.log("Refresh token has changed. Redirecting to login...");
          localStorage.removeItem('access_token');
          document.location.href = "/auth";
        }
        oldRefreshToken = refreshToken;
      }
      const refreshToken = getCookieValue("refresh_token");
      if (refreshToken && window.location.pathname === "/auth") {
        document.location.href = "/";
      }
    }, 500);
    return () => clearInterval(interval);
  }, [])
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/lesson" element={<Lesson />} />
            <Route path="/lesson/:id" element={<LessonDetail />} />
            <Route path="/games" element={<Games />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App;
