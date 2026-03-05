"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Star,
  Settings,
  ClipboardList,
  Package,
  Building2,
  DollarSign,
  BarChart3,
  Bell,
  Search,
  Plus,
  ListChecks,
  LogOut,
  User,
} from "lucide-react"

import { useRole } from "@/components/providers/role-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { NavLink, Role } from "@/lib/types"

// ─── Navigation config ────────────────────────────────────────────────────────

const NAV_LINKS: Record<Role, NavLink[]> = {
  client: [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "/client/orders", icon: ShoppingBag },
    { label: "Reviews", href: "/client/reviews", icon: Star },
    { label: "Settings", href: "/client/settings", icon: Settings },
  ],
  provider: [
    { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
    { label: "Order Queue", href: "/provider/queue", icon: ClipboardList },
    { label: "Products", href: "/provider/products", icon: Package },
    { label: "Reviews", href: "/provider/reviews", icon: Star },
    { label: "Settings", href: "/provider/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Providers", href: "/admin/providers", icon: Building2 },
    { label: "Fee Config", href: "/admin/fees", icon: DollarSign },
    { label: "Metrics", href: "/admin/metrics", icon: BarChart3 },
  ],
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function AppSidebar() {
  const { role, orgName } = useRole()
  const pathname = usePathname()
  const links = NAV_LINKS[role]

  return (
    <Sidebar>
      {/* Logo */}
      <SidebarHeader>
        <Link href={`/${role}/dashboard`} className="flex items-center gap-2 px-1">
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            SAGA
            <span className="text-[#3BAF99]">.</span>
            DENTAL
          </span>
        </Link>
      </SidebarHeader>

      <Separator className="bg-sidebar-border mx-4 w-auto" />

      {/* Nav links */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {links.map((link) => {
              const Icon = link.icon
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={link.href} className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — org + user info */}
      <SidebarFooter>
        <Separator className="bg-sidebar-border" />
        <div className="flex items-center gap-3 px-1 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {orgName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">
              {orgName}
            </p>
            <p className="truncate text-[10px] text-sidebar-foreground/50 capitalize">
              {role}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar() {
  const { role, orgName, userId } = useRole()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      {/* Sidebar toggle */}
      <SidebarTrigger />

      <Separator orientation="vertical" className="h-6" />

      {/* Search */}
      <div className="relative hidden flex-1 max-w-xs sm:flex">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="h-8 pl-8 text-sm bg-muted/40 border-transparent focus-visible:border-input focus-visible:bg-background"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Quick action */}
        <QuickAction role={role} />

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] leading-none">
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {orgName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{orgName}</p>
              <p className="text-xs text-muted-foreground capitalize">{role} · {userId}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// ─── Quick action button (role-aware) ─────────────────────────────────────────

function QuickAction({ role }: { role: Role }) {
  if (role === "client") {
    return (
      <Button size="sm" className="h-8 gap-1.5 text-xs" asChild>
        <Link href="/client/orders/new">
          <Plus className="h-3.5 w-3.5" />
          New Order
        </Link>
      </Button>
    )
  }
  if (role === "provider") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-xs"
        asChild
      >
        <Link href="/provider/queue">
          <ListChecks className="h-3.5 w-3.5" />
          View Queue
        </Link>
      </Button>
    )
  }
  return null
}
