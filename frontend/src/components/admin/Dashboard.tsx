
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
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
    return(
        <>
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
                            { name: "Content", lessons: countLessons, games: countGames },
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
                            { period: "Current", users: countUsers },
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
            </div>
        </>
    )
}
export default Dashboard;