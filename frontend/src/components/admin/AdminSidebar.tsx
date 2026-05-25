import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Users, BookOpen, Gamepad2, Award, Shield, TrendingUp, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { callCountAllGames, callCountAllLessons, callCountAllUsers } from "@/config/api";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";


interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [countUsers, setCountUsers] = useState(0);
  const [countLessons, setCountLessons]= useState(0);
  const [countGames, setCountGames]= useState(0);
  const { state } = useSidebar();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const navItems = [
    { id: "dashboard", title: "Dashboard", icon: TrendingUp, count: null },
    { id: "users", title: "Users", icon: Users, count: countUsers },
    { id: "lessons", title: "Lessons", icon: BookOpen, count: countLessons },
    { id: "games", title: "Games", icon: Gamepad2, count: countGames },
    { id: "points", title: "Points", icon: Award, count: null },
  ];

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
    console.log(res);
    if(res.statusCode == 200){
      setCountGames(res.data.count);
    }
  }

  useEffect(() =>{
    fetchCountUsers();
    fetchCountLessons();
    fetchCountGames();
  },[])

  return (
    <Sidebar className={collapsed ? "w-20" : "w-[250px]"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-background via-muted/30 to-primary/5">
        {/* Dashboard Header */}
        {!collapsed && (
          <div className="h-20 px-6 border-b border-border/50 flex items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
                  Admin
                </h2>
                <p className="text-sm text-muted-foreground leading-tight">Dashboard</p>
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="h-20 px-4 border-b border-border/50 flex items-center justify-center shrink-0">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className={collapsed ? "px-2" : ""}>
            {!collapsed && "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={`
                        group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${isActive
                          ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }
                        ${collapsed ? "justify-center" : "justify-start"}
                      `}
                    >
                      <Icon className={collapsed ? "h-5 w-5" : "h-5 w-5 mr-3 shrink-0 transition-colors"} />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full min-w-0">
                          <span className="truncate">{item.title}</span>
                          {item.count !== null && item.count > 0 && (
                            <span className={`
                              ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0
                              ${isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}
                            `}>
                              {item.count}
                            </span>
                          )}
                        </div>
                      )}
                      {isActive && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Home Button */}
      <div className={`p-4 border-t border-border/50 bg-background ${collapsed ? "flex justify-center" : ""}`}>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className={`w-full gap-2 ${collapsed ? "p-2 w-auto" : ""}`}
        >
          <Home className="h-4 w-4" />
          {!collapsed && <span>Về trang chủ</span>}
        </Button>
      </div>
    </Sidebar>
  );
}
