import { NavLink } from "react-router-dom";
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
import { Users, BookOpen, Gamepad2, Award, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminSidebarProps {
  stats: {
    users: number;
    lessons: number;
    games: number;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ stats, activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const navItems = [
    { id: "users", title: "Users", icon: Users, count: stats.users },
    { id: "lessons", title: "Lessons", icon: BookOpen, count: stats.lessons },
    { id: "games", title: "Games", icon: Gamepad2, count: stats.games },
    { id: "points", title: "Points", icon: Award, count: null },
  ];

  return (
    <Sidebar className={collapsed ? "w-20" : "w-72"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-background via-muted/30 to-primary/5">
        {/* Dashboard Header */}
        {!collapsed && (
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50" />
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Admin
                </h2>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="p-4 border-b border-border/50 flex justify-center">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {!collapsed && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Overview</span>
            </div>
            
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{stats.users}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <BookOpen className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{stats.lessons}</p>
                    <p className="text-xs text-muted-foreground">Total Lessons</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Gamepad2 className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{stats.games}</p>
                    <p className="text-xs text-muted-foreground">Total Games</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "px-2" : ""}>
            {!collapsed && "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={`
                        ${isActive 
                          ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold border-l-4 border-primary" 
                          : "hover:bg-muted/50"
                        }
                        ${collapsed ? "justify-center" : "justify-start"}
                        transition-all duration-200
                      `}
                    >
                      <Icon className={collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"} />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.count !== null && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {item.count}
                            </span>
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
