import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import UsersManagement from "@/components/admin/UsersManagement";
import LessonsManagement from "@/components/admin/LessonsManagement";
import GamesManagement from "@/components/admin/GamesManagement";
import { toast } from "sonner";
import PointsManagement from "@/components/admin/PointsManagement";
import { useAppSelector } from "@/redux/hook";
import Dashboard from "@/components/admin/Dashboard";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of system activity and performance" },
  users: { title: "Manage Users", subtitle: "Create, manage, and organize all users" },
  lessons: { title: "Manage Lessons", subtitle: "Create, manage, and organize lessons and vocabulary" },
  games: { title: "Manage Games", subtitle: "Create, manage, and organize all games" },
  points: { title: "Points & Rewards", subtitle: "Manage point transactions and reward rules" },
};

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = useAppSelector(state => state.account.user);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      if (user.role === "ADMIN") {
        setIsAdmin(true);
      } else {
        toast.error("Access denied. Admins only.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("An error occurred");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-500">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "users": return <UsersManagement />;
      case "lessons": return <LessonsManagement />;
      case "games": return <GamesManagement />;
      case "points": return <PointsManagement />;
      default: return <UsersManagement />;
    }
  };

  const meta = pageMeta[activeTab] || { title: activeTab, subtitle: "" };
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 flex items-center shrink-0">
            <div className="flex items-center justify-between w-full px-5">
              {/* Left: trigger + page title */}
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-8 w-8 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" />
                <div>
                  <h1 className="text-base font-semibold text-gray-900 leading-tight">{meta.title}</h1>
                  <p className="text-xs text-gray-400 leading-tight">{meta.subtitle}</p>
                </div>
              </div>

              {/* Right: user avatar */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name || "System Admin"}</p>
                  <p className="text-xs text-gray-400 leading-tight">{user?.username || "admin"}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">{initials}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-5">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
