"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Staff, StaffRole } from "@/lib/types";
import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { updateStaffRole } from "../actions";

const roleOptions: StaffRole[] = ["Admin", "Follow-Up Team", "Pending"];

export function RoleUpdateForm({ member }: { member: Staff }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<StaffRole>(member.role);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateStaffRole(member.id, selectedRole);
      if (result.success) {
        toast({
          title: "Success",
          description: `${member.full_name}'s role has been updated.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
    >
      <Select
        name="role"
        value={selectedRole}
        onValueChange={(value: StaffRole) => setSelectedRole(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        disabled={isPending || selectedRole === member.role}
        className="text-muted-foreground"
      >
        <Save className="h-5 w-5" />
        <span className="sr-only">Save</span>
      </Button>
    </form>
  );
}
