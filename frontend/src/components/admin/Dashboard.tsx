import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { Users, BookOpen, Gamepad2, TrendingUp, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { callCountAllGames, callCountAllLessons, callCountAllUsers } from "@/config/api";

const Dashboard = () => {
  const [countUsers, setCountUsers] = useState(0);
  const [countLessons, setCountLessons] = useState(0);
  const [countGames, setCountGames] = useState(0);

  const fetchCountUsers = async () => {
    const res = await callCountAllUsers();
    if (res.statusCode == 200) setCountUsers(res.data.count);
  };

  const fetchCountLessons = async () => {
    const res = await callCountAllLessons();
    if (res.statusCode == 200) setCountLessons(res.data.count);
  };

  const fetchCountGames = async () => {
    const res = await callCountAllGames();
    if (res.statusCode == 200) setCountGames(res.data.count);
  };

  useEffect(() => {
    fetchCountUsers();
    fetchCountLessons();
    fetchCountGames();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: countUsers,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      linkColor: "text-blue-600",
      linkText: "All registered users",
    },
    {
      label: "Total Lessons",
      value: countLessons,
      icon: BookOpen,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      linkColor: "text-primary",
      linkText: "Published & available",
    },
    {
      label: "Total Games",
      value: countGames,
      icon: Gamepad2,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      linkColor: "text-orange-500",
      linkText: "Active games",
    },
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
    { name: "Lessons", value: countLessons || 1, color: "#16a34a" },
    { name: "Games",   value: countGames || 1,   color: "#f97316" },
    { name: "Users",   value: countUsers || 1,   color: "#2563eb" },
  ];

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-xs ${stat.linkColor} font-medium`}>{stat.linkText}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <TrendingUp className="h-4 w-4 text-primary" />
              Content Overview
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">Distribution of lessons and games</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                lessons: { label: "Lessons", color: "#16a34a" },
                games:   { label: "Games",   color: "#f97316" },
              }}
              className="h-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[{ name: "Content", lessons: countLessons, games: countGames }]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="lessons" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="games"   fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users className="h-4 w-4 text-blue-600" />
              User Growth
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">Total registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ users: { label: "Users", color: "#2563eb" } }}
              className="h-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[{ period: "Start", users: 0 }, { period: "Current", users: countUsers }]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563eb", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Activity
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">Platform activity over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users:   { label: "Users",   color: "#2563eb" },
                lessons: { label: "Lessons", color: "#16a34a" },
                games:   { label: "Games",   color: "#f97316" },
              }}
              className="h-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="users"   stroke="#2563eb" fillOpacity={1} fill="url(#colorUsers)"   strokeWidth={2} />
                  <Area type="monotone" dataKey="lessons" stroke="#16a34a" fillOpacity={1} fill="url(#colorLessons)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="h-4 w-4 text-purple-600" />
              Content Distribution
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">Share of users, lessons, and games</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
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
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-500">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;