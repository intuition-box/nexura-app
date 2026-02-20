import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Shield, UserCog, UserMinus } from "lucide-react";
import { apiRequest } from "../lib/config.ts";

interface ManageAdminModalProps {
  children: React.ReactNode;
  name: string;
  role: "Super Admin" | "Admin" | "Moderator";
  onSuccess?: () => void;
}

export function ManageAdminModal({ children, name, role, onSuccess }: ManageAdminModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>((role || "Admin").toLowerCase().replace(" ", "_"));

  // TODO: server needs POST /api/admin/update-role and POST /api/admin/demote-admin routes.
  const handleUpdateRole = async () => {
    setLoading(true);
    try {
      await apiRequest<{ message?: string }>({
        endpoint: "/api/admin/update-role",
        method: "POST",
        data: { adminName: name, newRole: selectedRole },
      });
      onSuccess?.();
      setOpen(false);
    } catch (error) {
      console.error("Failed to update admin role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemote = async () => {
    setLoading(true);
    try {
      await apiRequest<{ message?: string }>({
        endpoint: "/api/admin/demote-admin",
        method: "POST",
        data: { adminName: name },
      });
      onSuccess?.();
      setOpen(false);
    } catch (error) {
      console.error("Failed to demote admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    try {
      await apiRequest<{ message?: string }>({
        endpoint: "/api/admin/remove-admin",
        method: "POST",
        data: { adminName: name },
      });
      onSuccess?.();
      setOpen(false);
    } catch (error) {
      console.error("Failed to revoke admin access:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-[#0a0a0a]/90 backdrop-blur-xl border-white/10 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 rounded-full bg-[#8a3ffc]/20">
              <UserCog className="w-5 h-5 text-[#8a3ffc]" />
            </div>
            Manage Access
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Upgrade, temporarily remove access, or revoke this admin completely.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a3ffc] to-[#6366f1] flex items-center justify-center text-white font-bold">
              {(name || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold">{name || "Unknown Admin"}</p>
              <p className="text-white/60 text-sm">Current Role: {role || "Admin"}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role" className="text-white/70">Change Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#8a3ffc]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem value="super_admin" className="focus:bg-white/10 focus:text-white">Super Admin</SelectItem>
                <SelectItem value="admin" className="focus:bg-white/10 focus:text-white">Admin</SelectItem>
                <SelectItem value="moderator" className="focus:bg-white/10 focus:text-white">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="w-full sm:w-auto text-white/70 hover:text-white hover:bg-white/5">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleUpdateRole}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-[#8a3ffc] to-[#522696] text-white rounded-md hover:opacity-90 transition-opacity shadow-[0px_0px_15px_rgba(138,63,252,0.4)] gap-2"
          >
            <Shield className="w-4 h-4" />
            Update Role
          </Button>
          <Button
            onClick={handleDemote}
            disabled={loading}
            variant="outline"
            className="w-full sm:w-auto border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 gap-2"
          >
            <UserCog className="w-4 h-4" />
            Demote
          </Button>
          <Button
            onClick={handleRevoke}
            disabled={loading}
            variant="outline"
            className="w-full sm:w-auto border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
          >
            <UserMinus className="w-4 h-4" />
            Revoke Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}