import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import UsersManagement from "@/components/admin/UsersManagement";
import LessonsManagement from "@/components/admin/LessonsManagement";
import GamesManagement from "@/components/admin/GamesManagement";
import { Users, BookOpen, Gamepad2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import PointsManagement from "@/components/admin/PointsManagement";
import { useAppSelector } from "@/redux/hook";


const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState({
    users: 0,
    lessons: 0,
    games: 0,
  });
  const user = useAppSelector(state => state.account.user);

  useEffect(() => {
    checkAdminStatus();
    fetchStats();
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
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersManagement />;
      case "lessons":
        return <LessonsManagement />;
      case "games":
        return <GamesManagement />;
      case "points":
        return <PointsManagement />;
      //   case "vocabulary":
      // return <VocabularyManagement />;
      default:
        return <UsersManagement />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-muted/30 to-primary/5">

          <AdminSidebar
            stats={stats}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

        <main className="flex-1 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          </div>

          <div className="relative z-10">
            {/* Header with Sidebar Trigger */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border/50">
              <div className="container mx-auto px-6 py-[26px] flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
                  </h1>
                  <p className="text-sm text-muted-foreground">Manage your {activeTab}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="container mx-auto px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in">
                <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Content Overview
                    </CardTitle>
                    <CardDescription>Distribution of lessons and games</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        lessons: {
                          label: "Lessons",
                          color: "hsl(var(--secondary))",
                        },
                        games: {
                          label: "Games",
                          color: "hsl(var(--accent))",
                        },
                      }}
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "Content", lessons: stats.lessons, games: stats.games },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="lessons" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="games" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      User Growth
                    </CardTitle>
                    <CardDescription>Total registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        users: {
                          label: "Users",
                          color: "hsl(var(--primary))",
                        },
                      }}
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { period: "Start", users: 0 },
                            { period: "Current", users: stats.users },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={{ fill: "hsl(var(--primary))", r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Content Management Section */}
              <div className="animate-fade-in">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
