import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersManagement from "@/components/admin/UsersManagement";
import LessonsManagement from "@/components/admin/LessonsManagement";
import GamesManagement from "@/components/admin/GamesManagement";
import StatsCard from "@/components/StatsCard";
import { Users, BookOpen, Gamepad2, Shield, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

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
        toast.error("Please login");
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
        toast.error("You don't have permission to access this page");
        navigate("/");
        return;
      }

      setIsAdmin(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-xl opacity-50" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">English Learning System Management</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <StatsCard
              icon={Users}
              label="Total Users"
              value={stats.users}
              color="primary"
            />
            <StatsCard
              icon={BookOpen}
              label="Total Lessons"
              value={stats.lessons}
              color="secondary"
            />
            <StatsCard
              icon={Gamepad2}
              label="Total Games"
              value={stats.games}
              color="accent"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
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

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl">
            <TabsTrigger 
              value="users" 
              className="gap-2 py-4 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              <Users className="h-5 w-5" />
              <span className="hidden sm:inline font-semibold">Users Management</span>
              <span className="sm:hidden font-semibold">Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lessons" 
              className="gap-2 py-4 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg"
            >
              <BookOpen className="h-5 w-5" />
              <span className="hidden sm:inline font-semibold">Lessons Management</span>
              <span className="sm:hidden font-semibold">Lessons</span>
            </TabsTrigger>
            <TabsTrigger 
              value="games" 
              className="gap-2 py-4 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg"
            >
              <Gamepad2 className="h-5 w-5" />
              <span className="hidden sm:inline font-semibold">Games Management</span>
              <span className="sm:hidden font-semibold">Games</span>
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
