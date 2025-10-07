"use server";

import { createClient } from "@/lib/supabase/server";
import { StaffRole } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function updateStaffRole(staffId: string, newRole: StaffRole) {
  const supabase = createClient();

  const { error } = await supabase
    .from("staff")
    .update({ role: newRole })
    .eq("id", staffId);

  if (error) {
    console.error("Supabase role update error:", error.message);
    return { success: false, error: "Failed to update role." };
  }

  revalidatePath("/admin/staff");
  return { success: true };
}
