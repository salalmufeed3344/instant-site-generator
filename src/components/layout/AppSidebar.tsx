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
  Activity,
  HeartPulse,
  Home,
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
  { title: "Overview", url: "/overview", icon: Home },
  { title: "Health", url: "/health", icon: HeartPulse },
  { title: "Activity", url: "/activity", icon: Activity },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
] as const;

const intelligenceNav = [
  { title: "Knowledge Hub", url: "/knowledge", icon: BookOpen },
  { title: "Organization Graph", url: "/organization-graph", icon: Network },
  { title: "Memory Center", url: "/memory", icon: Brain },
] as const;

const workforceNav = [
  { title: "AI Departments", url: "/ai-departments", icon: Bot },
  { title: "AI Task Center", url: "/ai-tasks", icon: ListChecks },
  { title: "Task History", url: "/task-history", icon: History },
  { title: "Departments", url: "/departments", icon: Users },
  { title: "Templates", url: "/templates", icon: Sparkles },
  { title: "Workflows", url: "/workflows", icon: Workflow },
] as const;

const accountNav = [
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const renderGroup = (label: string, items: readonly { title: string; url: string; icon: any }[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
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
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="px-2 py-1.5">
          <Logo />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Workspace", workspaceNav)}
        {renderGroup("Intelligence", intelligenceNav)}
        {renderGroup("AI Workforce", workforceNav)}
        {renderGroup("Account", accountNav)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-1 text-[11px] text-muted-foreground">
          CortexOS · Phase 6
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
