
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Users, BookOpen, Gamepad2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { callCountAllGames, callCountAllLessons, callCountAllUsers } from "@/config/api";

const Dashboard = () =>{
  const [countUsers, setCountUsers] = useState(0);
  const [countLessons, setCountLessons]= useState(0);
  const [countGames, setCountGames]= useState(0);

   const fetchCountUsers = async () =>{
      const res = await callCountAllUsers();
      if(res.statusCode == 200){
        setCountUsers(res.data.count);
      }
    }
  
    const fetchCountLessons = async () =>{
      const res = await callCountAllLessons();
      if(res.statusCode == 200){
        setCountLessons(res.data.count);
      }
    }
  
    const fetchCountGames = async () =>{
      const res = await callCountAllGames();
      if(res.statusCode == 200){
        setCountGames(res.data.count);
      }
    }
  
    useEffect(() =>{
      fetchCountUsers();
      fetchCountLessons();
      fetchCountGames();
    },[])
    const statCards = [
      { label: "Total Users", value: countUsers, icon: Users, bg: "bg-primary/10", text: "text-primary" },
      { label: "Total Lessons", value: countLessons, icon: BookOpen, bg: "bg-secondary/10", text: "text-secondary" },
      { label: "Total Games", value: countGames, icon: Gamepad2, bg: "bg-accent/10", text: "text-accent" },
    ];

    const weeklyData = [
      { day: "Mon", users: Math.max(0, countUsers - 4), lessons: Math.max(0, countLessons - 2), games: Math.max(0, countGames - 1) },
      { day: "Tue", users: Math.max(0, countUsers - 3), lessons: Math.max(0, countLessons - 1), games: Math.max(0, countGames - 1) },
      { day: "Wed", users: Math.max(0, countUsers - 2), lessons: countLessons, games: countGames },
      { day: "Thu", users: Math.max(0, countUsers - 1), lessons: countLessons, games: countGames },
      { day: "Fri", users: countUsers, lessons: countLessons, games: countGames },
      { day: "Sat", users: countUsers, lessons: countLessons, games: countGames },
      { day: "Sun", users: countUsers, lessons: countLessons, games: Math.max(0, countGames + 1) },
    ];

    const pieData = [
      { name: "Lessons", value: countLessons || 1, color: "hsl(var(--secondary))" },
      { name: "Games", value: countGames || 1, color: "hsl(var(--accent))" },
      { name: "Users", value: countUsers || 1, color: "hsl(var(--primary))" },
    ];

    return(
        <>
            <div className="space-y-4">
              {/* Overview Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="bg-white border-gray-200 shadow-md overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <p className="text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <Icon className={`h-6 w-6 ${stat.text}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Top Row Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-fade-in">
                <Card className="bg-white border-gray-200 shadow-md">
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
                        lessons: { label: "Lessons", color: "hsl(var(--secondary))" },
                        games: { label: "Games", color: "hsl(var(--accent))" },
                      }}
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[{ name: "Content", lessons: countLessons, games: countGames }]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="lessons" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="games" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      User Growth
                    </CardTitle>
                    <CardDescription>Total registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{ users: { label: "Users", color: "hsl(var(--primary))" } }}
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[{ period: "Start", users: 0 }, { period: "Current", users: countUsers }]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="period" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
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

              {/* Bottom Row Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-fade-in">
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Weekly Activity
                    </CardTitle>
                    <CardDescription>Platform activity over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        users: { label: "Users", color: "hsl(var(--primary))" },
                        lessons: { label: "Lessons", color: "hsl(var(--secondary))" },
                        games: { label: "Games", color: "hsl(var(--accent))" },
                      }}
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="day" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                          <Area type="monotone" dataKey="lessons" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorLessons)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                      Content Distribution
                    </CardTitle>
                    <CardDescription>Share of users, lessons, and games</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{}}
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
        </>
    )
}
export default Dashboard;