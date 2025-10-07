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
import { LayoutDashboard, Users, LogOut, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";
import { getStaffMember } from "@/lib/data";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
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
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin" leftSlot={<LayoutDashboard />}>
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/visitors" leftSlot={<Users />}>
                Visitors
              </SidebarMenuButton>
            </SidebarMenuItem>
            {staffMember?.role === 'Admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/staff" leftSlot={<Shield />}>
                  Staff
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
