import { useEffect, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Bell, Building2, LogOut, Search, UserCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CommandPalette, useCommandPaletteHotkey } from "@/components/search/CommandPalette";

function humanize(segment: string) {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AppTopbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const segments = pathname.split("/").filter(Boolean);
  const crumb = segments[0] ? humanize(segments[0]) : "Overview";
  const { user } = useAuth();
  const email = user?.email ?? "";
  const initials = (email[0] ?? "?").toUpperCase();
  const [orgName, setOrgName] = useState<string>("Workspace");
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandPaletteHotkey(() => setPaletteOpen(true));

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("organization_id, organizations(name)")
        .eq("id", userData.user.id)
        .maybeSingle();
      const name = (data as { organizations?: { name?: string } | null } | null)
        ?.organizations?.name;
      if (active && name) setOrgName(name);
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="max-w-[160px] truncate font-medium">{orgName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuItem className="flex-col items-start">
            <span className="font-medium">{orgName}</span>
            <span className="text-xs text-muted-foreground">Current workspace</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            Create organization (Phase 2)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="hidden text-muted-foreground/50 md:inline">/</span>
      <span className="hidden text-sm font-medium text-foreground md:inline">
        {crumb}
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="relative hidden h-9 w-64 items-center gap-2 rounded-md border border-input bg-background pl-8 pr-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/40 md:flex"
          aria-label="Open search"
        >
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <span className="flex-1 truncate">Search workspace…</span>
          <kbd className="pointer-events-none ml-auto hidden select-none rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
            ⌘K
          </kbd>
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You're all caught up. Activity will appear here.
            </p>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex-col items-start">
              <span className="text-sm font-medium">Signed in</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.navigate({ to: "/profile" })}>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
