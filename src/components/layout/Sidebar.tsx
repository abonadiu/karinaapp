import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  Users,
  LayoutDashboard,
  User,
  LogOut,
  BarChart3,
  Shield,
  Building,
  ChevronUp
} from "lucide-react";
import React, { useCallback, useRef } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { BrandSymbol } from "@/components/site/BrandSymbol";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Empresas", url: "/empresas", icon: Building2 },
  { title: "Participantes", url: "/participantes", icon: Users },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const MIN_WIDTH = 64;
const MAX_WIDTH = 450;
const DEFAULT_WIDTH = 256;
const DRAG_THRESHOLD = 5;

function SidebarResizeHandle() {
  const { setOpen, open, setSidebarWidth, isMobile } = useSidebar();
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;

    // Get current sidebar width from CSS variable
    const wrapper = (e.currentTarget as HTMLElement).closest('.group\\/sidebar-wrapper') as HTMLElement;
    const currentWidth = wrapper
      ? parseFloat(getComputedStyle(wrapper).getPropertyValue('--sidebar-width')) || DEFAULT_WIDTH
      : DEFAULT_WIDTH;
    startWidth.current = open ? currentWidth : MIN_WIDTH;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = moveEvent.clientX - startX.current;
      if (Math.abs(delta) > DRAG_THRESHOLD) {
        hasDragged.current = true;
      }

      const newWidth = Math.max(MIN_WIDTH, Math.min(startWidth.current + delta, MAX_WIDTH));
      setSidebarWidth(`${newWidth}px`);
      if (!open) setOpen(true);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (!hasDragged.current) {
        // It was a click, not a drag — toggle
        if (open) {
          setOpen(false);
        } else {
          setSidebarWidth(`${DEFAULT_WIDTH}px`);
          setOpen(true);
        }
      }
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isMobile, open, setOpen, setSidebarWidth]);

  if (isMobile) return null;

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute inset-y-0 -right-[6px] z-20 hidden w-3 cursor-col-resize sm:flex items-center justify-center group/handle"
      title="Arrastar para redimensionar ou clicar para recolher"
    >
      <div className="h-full w-[2px] bg-transparent transition-colors group-hover/handle:bg-sidebar-border" />
    </div>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, profile, signOut, isAdmin, isManager, managerCompanyId } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <BrandSymbol size={28} color="#335072" className="shrink-0" />
          {!collapsed && (
            <span
              className="text-[#335072] text-sm tracking-[0.15em] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              KARINA BONADIU
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-3 w-full hover:bg-sidebar-accent rounded-md transition-colors">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">
                      {profile?.full_name || user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {isAdmin ? "Administrador" : isManager ? "Gestor" : "Facilitador"}
                    </p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-56"
          >
            {isManager && managerCompanyId && (
              <DropdownMenuItem asChild>
                <Link to="/empresa/portal" className="cursor-pointer">
                  <Building className="mr-2 h-4 w-4" />
                  Portal da Empresa
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to="/perfil" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/admin" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  Administração
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarResizeHandle />
    </Sidebar>
  );
}
