// src/app/admin/layout.tsx - CORRECTED AND FULLY FUNCTIONAL

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, LogOut, Shield, Clock, CheckSquare } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";
import { getStaffMember } from "@/lib/data";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staffMember = await getStaffMember(user.id);

  if (!staffMember || staffMember.role === 'Pending') {
    // Even if there is a user session, if they are not a valid staff member
    // or are pending approval, sign them out and redirect to login.
    await supabase.auth.signOut();
    redirect('/login?message=Your account is pending approval or could not be verified.');
  }

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : "?";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>

            {/* --- CORRECTED DASHBOARD LINK --- */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin" className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* --- CORRECTED VISITORS LINK --- */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/visitors" className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Visitors</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* --- ATTENDANCE LINK --- */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/attendance" className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5" />
                  <span>Attendance</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* --- CORRECTED STAFF LINK --- */}
            {staffMember?.role === 'Admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/staff" className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <span>Staff</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {/* --- SCHEDULING LINK --- */}
            {staffMember?.role === 'Admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/scheduling" className="flex items-center gap-3">
                    <Clock className="h-5 w-5" />
                    <span>Scheduling</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata.avatar_url} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
          <form action={signOut}>
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}