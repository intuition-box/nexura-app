"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { projectApiRequest } from "../lib/projectApi";
import { useToast } from "../hooks/use-toast";

interface AddAdminModalProps {
  children?: React.ReactNode;
  /** Called after OTP invite is sent successfully */
  onSuccess?: () => void;
}

export function AddAdminModal({ children, onSuccess }: AddAdminModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const { toast } = useToast();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      toast({ title: "Missing email", description: "Please enter the admin's email.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await projectApiRequest({
        method: "POST",
        endpoint: "/hub/add-admin",
        data: { email, role, clientUrl: window.location.origin },
      });
      toast({ title: "Invitation sent!", description: `An OTP has been sent to ${email}. The ${role === "superadmin" ? "Super Admin" : "Admin"} can now sign up.` });
      setEmail("");
      setRole("admin");
      setOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send invitation.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-[#0d0d14] backdrop-blur-xl border border-purple-500/20 text-white shadow-[0_0_60px_rgba(131,58,253,0.2)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 rounded-full bg-[#8a3ffc]/20">
              <UserPlus className="w-5 h-5 text-[#8a3ffc]" />
            </div>
            Add Administrator
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Invite a new administrator to the dashboard. They will appear immediately in the table.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white/70">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#8a3ffc]"
              required
            />
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-white/70">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "superadmin")}>
              <SelectTrigger
                id="role"
                className="bg-white/5 border-white/10 text-white focus:ring-[#8a3ffc]"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d0d14] border-white/10 text-white">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-2 pt-1">
          <DialogClose asChild>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-semibold hover:opacity-90 hover:shadow-[0_0_20px_rgba(131,58,253,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {loading ? "Sending Invitation..." : "Send Invitation"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};