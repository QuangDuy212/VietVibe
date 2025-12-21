import { Button } from "@/components/ui/button";
import { BookOpen, User, Globe, Shield, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { callFetchAccount, callLogout } from "@/config/api";
import { setLogoutAction } from "@/redux/slice/accountSlide";
import { useAppSelector } from "@/redux/hook";

const Header = () => {
  const [language, setLanguage] = useState("en");
  const [isAdmin, setIsAdmin] = useState(false);
  const user = useAppSelector(state => state.account.user);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    checkAuthStatus();
  }, [user]);

  const checkAuthStatus = async () => {
    if (user && user._id) {
      if (user.role === "ADMIN") {
        setIsAdmin(true);
      }
    }
  };

  const handleLogout = async () => {
    const res = await callLogout();
    if (res.statusCode === 200) {
      toast.success( "Đăng xuất thành công ");
      navigate("/auth");
      dispatch(setLogoutAction({}));
    } else {
      toast.error( "Đăng xuất thất bại ");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            VietVibe
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/lesson" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Lessons
          </Link>
          <Link to="/games" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Games
          </Link>
          <Link to="/profile" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Profile
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          ) : (
            <Button variant="gradient" size="sm" asChild>
              <Link to="/auth">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
