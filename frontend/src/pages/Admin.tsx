import { useEffect, useState } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import UsersManagement from "@/components/admin/UsersManagement";
import CreateUser from "@/components/admin/CreateUser";
import UpdateUser, { UserItem } from "@/components/admin/UpdateUser";
import LessonsManagement from "@/components/admin/LessonsManagement";
import UpdateLesson from "@/components/admin/UpdateLesson";
import { ILesson } from "@/types/common.type";
import GamesManagement from "@/components/admin/GamesManagement";
import { toast } from "sonner";
import PointsManagement from "@/components/admin/PointsManagement";
import { useAppSelector } from "@/redux/hook";
import Dashboard from "@/components/admin/Dashboard";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of system activity and performance" },
  users: { title: "Manage Users", subtitle: "Create, manage, and organize all users" },
  "create-user": { title: "Add New User", subtitle: "Register a new user account" },
  "edit-user": { title: "Edit User", subtitle: "Modify user account details" },
  "view-user": { title: "User Details", subtitle: "View user information" },
  lessons: { title: "Manage Lessons", subtitle: "Create, manage, and organize lessons and vocabulary" },
  "create-lesson": { title: "Create Lesson", subtitle: "Add a new lesson" },
  "edit-lesson": { title: "Edit Lesson", subtitle: "Modify lesson content" },
  "view-lesson": { title: "View Lesson", subtitle: "View lesson details" },
  games: { title: "Manage Games", subtitle: "Create, manage, and organize all games" },
  points: { title: "Points & Rewards", subtitle: "Manage point transactions and reward rules" },
};

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const user = useAppSelector(state => state.account.user);
  const isAccountLoading = useAppSelector(state => state.account.isLoading);

  useEffect(() => {
    if (!isAccountLoading) {
      checkAdminStatus();
    }
  }, [isAccountLoading, user.role]);

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

  if (loading || isAccountLoading) {
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

  const currentPath = location.pathname.replace(/\/$/, '');
  
  const getActiveTab = () => {
    if (currentPath === "/admin") return "dashboard";
    if (currentPath.startsWith("/admin/users")) return "users";
    if (currentPath.startsWith("/admin/create-user")) return "create-user";
    if (currentPath.startsWith("/admin/edit-user")) return "edit-user";
    if (currentPath.startsWith("/admin/view-user")) return "view-user";
    if (currentPath.startsWith("/admin/lessons")) return "lessons";
    if (currentPath.startsWith("/admin/create-lesson")) return "create-lesson";
    if (currentPath.startsWith("/admin/edit-lesson")) return "edit-lesson";
    if (currentPath.startsWith("/admin/view-lesson")) return "view-lesson";
    if (currentPath.startsWith("/admin/games")) return "games";
    if (currentPath.startsWith("/admin/points")) return "points";
    return "dashboard";
  };
  
  const activeTab = getActiveTab();
  const meta = pageMeta[activeTab] || { title: "Admin Panel", subtitle: "" };
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AdminSidebar />

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
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={
                <UsersManagement 
                  onCreateUser={() => navigate("/admin/create-user")} 
                  onEditUser={(user) => { setSelectedUser(user); navigate("/admin/edit-user"); }}
                  onViewUser={(user) => { setSelectedUser(user); navigate("/admin/view-user"); }}
                />
              } />
              <Route path="/create-user" element={<CreateUser onBack={() => navigate("/admin/users")} />} />
              <Route path="/edit-user" element={
                <UpdateUser mode="edit" user={selectedUser} onBack={() => { navigate("/admin/users"); setSelectedUser(null); }} />
              } />
              <Route path="/view-user" element={
                <UpdateUser mode="view" user={selectedUser} onBack={() => { navigate("/admin/users"); setSelectedUser(null); }} />
              } />
              <Route path="/lessons" element={
                <LessonsManagement
                  onCreateLesson={() => navigate("/admin/create-lesson")}
                  onEditLesson={(lesson) => { setSelectedLesson(lesson); navigate("/admin/edit-lesson"); }}
                  onViewLesson={(lesson) => { setSelectedLesson(lesson); navigate("/admin/view-lesson"); }}
                />
              } />
              <Route path="/create-lesson" element={
                <UpdateLesson mode="create" lesson={null} onBack={() => navigate("/admin/lessons")} />
              } />
              <Route path="/edit-lesson" element={
                <UpdateLesson mode="edit" lesson={selectedLesson} onBack={() => { navigate("/admin/lessons"); setSelectedLesson(null); }} />
              } />
              <Route path="/view-lesson" element={
                <UpdateLesson mode="view" lesson={selectedLesson} onBack={() => { navigate("/admin/lessons"); setSelectedLesson(null); }} />
              } />
              <Route path="/games" element={<GamesManagement />} />
              <Route path="/points" element={<PointsManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
