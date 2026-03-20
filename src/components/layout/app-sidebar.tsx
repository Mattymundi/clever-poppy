"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Palette,
  Image,
  Clock,
  Settings,
  GitBranch,
  MessageSquare,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"

const mainNav = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Generate", icon: Sparkles, path: "/generate" },
  { title: "History", icon: Clock, path: "/history" },
  { title: "Feedback", icon: MessageSquare, path: "/feedback" },
]

const configNav = [
  { title: "Personas", icon: Users, path: "/personas" },
  { title: "Ad Types", icon: Palette, path: "/ad-types" },
  { title: "Image Libraries", icon: Image, path: "/image-libraries" },
]

const systemNav = [
  { title: "How It Works", icon: GitBranch, path: "/system-diagram" },
  { title: "Settings", icon: Settings, path: "/settings" },
]

function NavGroup({ items, label }: { items: typeof mainNav; label?: string }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {label && (
        <div className="px-3 py-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {label}
          </span>
        </div>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path)

            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.title}
                  render={<Link href={item.path} />}
                >
                  <item.icon className="!size-[18px]" />
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />} tooltip="Clever Poppy">
              <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold tracking-tight">
                  Clever Poppy
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Ad Generator
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <NavGroup items={mainNav} />
        <NavGroup items={configNav} label="Configure" />
      </SidebarContent>

      <SidebarFooter>
        <NavGroup items={systemNav} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
