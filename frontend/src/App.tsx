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
  const isLoading = useAppSelector((state) => state.account.isLoading);

  useEffect(() => {
    const publicPaths = ["/login", "/register", "/auth"];
    const currentPath = window.location.pathname;
  
    // 1. Hàm lấy cookie
    const getCookieValue = (name: string) => {
      const cookies = document.cookie.split("; ");
      for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
      }
      return null;
    };
  
    const refreshToken = getCookieValue("refresh_token");
  
    // 2. Kiểm tra ngay lập tức khi vào app
    if (!refreshToken && !publicPaths.includes(currentPath)) {
      // Nếu không có token và không ở trang public -> Chuyển về auth
      window.location.href = "/auth"; 
      return;
    }
  
    if (refreshToken && currentPath === "/auth") {
      // Nếu đã có token mà vẫn ở auth -> Chuyển về home
      window.location.href = "/";
      return;
    }
  
    // 3. Nếu đã đăng nhập, fetch thông tin user
    if (refreshToken) {
      dispatch(fetchAccount());
    }
  
    // 4. Interval để theo dõi việc logout ở tab khác hoặc hết hạn token
    let oldRefreshToken = refreshToken;
    const interval = setInterval(() => {
      const currentToken = getCookieValue("refresh_token");
      const path = window.location.pathname;
  
      // Nếu bỗng dưng mất token (người dùng logout ở tab khác)
      if (!currentToken && !publicPaths.includes(path)) {
        localStorage.removeItem("access_token");
        window.location.href = "/auth";
      }
  
      // Nếu token thay đổi (đăng nhập bằng user khác)
      if (oldRefreshToken && currentToken && oldRefreshToken !== currentToken) {
        window.location.reload(); // Load lại để cập nhật data mới
      }
      
      oldRefreshToken = currentToken;
    }, 1000); // 1 giây kiểm tra 1 lần là đủ, tránh tốn hiệu năng
  
    return () => clearInterval(interval);
  }, [dispatch]);
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
  );
};

export default App;
