import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Workflow,
  Brain,
  ListChecks,
  Settings,
  UserCircle,
  Sparkles,
  Network,
  Bot,
  History,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";

const workspaceNav = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Knowledge Hub", url: "/knowledge", icon: BookOpen },
  { title: "Organization Graph", url: "/organization-graph", icon: Network },
  { title: "AI Departments", url: "/ai-departments", icon: Bot },
  { title: "AI Task Center", url: "/ai-tasks", icon: ListChecks },
  { title: "Task History", url: "/task-history", icon: History },
  { title: "Departments", url: "/departments", icon: Users },
  { title: "Templates", url: "/templates", icon: Sparkles },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Memory Center", url: "/memory", icon: Brain },
  { title: "Tasks", url: "/tasks", icon: ListChecks },
] as const;

const accountNav = [
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="px-2 py-1.5">
          <Logo />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-1 text-[11px] text-muted-foreground">
          CortexOS · Phase 4
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
