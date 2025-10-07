import { getAllStaff, getStaffMember } from "@/lib/data";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoleUpdateForm } from "./components/RoleUpdateForm";

export default async function StaffPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staffMember = await getStaffMember(user.id);

  if (staffMember?.role !== 'Admin') {
    redirect("/admin?error=You do not have permission to view this page.");
  }
  
  const staff = await getAllStaff();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Staff Management</h1>
        <p className="text-muted-foreground">
          Approve new members and manage roles.
        </p>
      </header>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.full_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{format(new Date(member.created_at), "PPP")}</TableCell>
                <TableCell>
                  <RoleUpdateForm member={member} />
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
