import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Users, BookOpen, Gamepad2, Award, TrendingUp, Home, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { callCountAllGames, callCountAllLessons, callCountAllUsers } from "@/config/api";
import { useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const navItems = [
    { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
    { id: "users", title: "Users", icon: Users },
    { id: "lessons", title: "Lessons", icon: BookOpen },
    { id: "games", title: "Games", icon: Gamepad2 },
    { id: "points", title: "Points & Rewards", icon: Award },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Logo Header */}
        <div className={`flex items-center gap-3 px-4 border-b border-gray-100 shrink-0 ${collapsed ? "h-16 justify-center" : "h-16"}`}>
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-md shrink-0">
            <span className="text-white font-bold text-base leading-none">V</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">VietVibe</h2>
              <p className="text-[10px] text-gray-400 leading-tight tracking-wide uppercase">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-3 py-4 flex-1">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              Menu
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={`
                        group relative flex items-center rounded-xl px-4 py-3.5 text-[15.5px] font-medium transition-all duration-150 cursor-pointer w-full
                        ${isActive
                          ? "bg-primary text-white shadow-sm hover:bg-primary hover:text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }
                        ${collapsed ? "justify-center" : "justify-start gap-3"}
                      `}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <Icon
                        className={`shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                        }`}
                        size={22}
                      />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full min-w-0">
                          <span className="truncate">{item.title}</span>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Home Button */}
        <div className={`p-3 border-t border-gray-100 shrink-0`}>
          <button
            onClick={() => navigate("/")}
            className={`
              flex items-center gap-3 w-full rounded-xl px-4 py-3.5 text-[15.5px] font-medium
              text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <Home size={22} className="shrink-0 text-gray-500" />
            {!collapsed && <span>Về trang chủ</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
