import { getAllStaff, getStaffMember } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import CardContent, CardHeader, CardTitle
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
import { EmailStaffForm } from "./components/EmailStaffForm";
import { ScheduledEmailsList } from "./components/ScheduledEmailsList";

async function getScheduledEmails() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scheduled_emails")
    .select("*")
    .eq("status", "pending")
    .order("send_at", { ascending: true });

  if (error) {
    console.error("Error fetching scheduled emails:", error.message);
    return [];
  }
  return data;
}

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staffMember = await getStaffMember(user.id);

  if (staffMember?.role !== 'Admin') {
    redirect("/admin?error=You do not have permission to view this page.");
  }

  const [staff, scheduledEmails] = await Promise.all([
    getAllStaff(),
    getScheduledEmails()
  ]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage roles, send immediate emails, or schedule them for the future.
          </p>
        </div>
        <EmailStaffForm staff={staff} />
      </header>

      <ScheduledEmailsList emails={scheduledEmails} />

      {/* CORRECTED STAFF MEMBERS CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}