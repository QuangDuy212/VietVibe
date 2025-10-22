import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersManagement from "@/components/admin/UsersManagement";
import LessonsManagement from "@/components/admin/LessonsManagement";
import GamesManagement from "@/components/admin/GamesManagement";
import StatsCard from "@/components/StatsCard";
import { Users, BookOpen, Gamepad2, Shield } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    lessons: 0,
    games: 0,
  });

  useEffect(() => {
    checkAdminStatus();
    fetchStats();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vui lòng đăng nhập");
        navigate("/auth");
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (error) throw error;

      if (!roles || roles.length === 0) {
        toast.error("Bạn không có quyền truy cập trang này");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Có lỗi xảy ra");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersCount, lessonsCount, gamesCount] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("lessons").select("*", { count: "exact", head: true }),
        supabase.from("games").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        users: usersCount.count || 0,
        lessons: lessonsCount.count || 0,
        games: gamesCount.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Quản lý hệ thống học tiếng Anh</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              icon={Users}
              label="Tổng Users"
              value={stats.users}
              color="primary"
            />
            <StatsCard
              icon={BookOpen}
              label="Tổng Lessons"
              value={stats.lessons}
              color="secondary"
            />
            <StatsCard
              icon={Gamepad2}
              label="Tổng Games"
              value={stats.games}
              color="accent"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-auto p-1 bg-card/50 backdrop-blur">
            <TabsTrigger value="users" className="gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Quản lý Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Quản lý Lessons</span>
              <span className="sm:hidden">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Quản lý Games</span>
              <span className="sm:hidden">Games</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4">
            <LessonsManagement />
          </TabsContent>

          <TabsContent value="games" className="space-y-4">
            <GamesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
