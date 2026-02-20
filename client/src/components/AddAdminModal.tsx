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
        endpoint: "/project/add-admin",
        data: { email },
      });
      toast({ title: "Invitation sent!", description: `An OTP has been sent to ${email}. The admin can now sign up.` });
      setEmail("");
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

      <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a]/90 backdrop-blur-xl border-white/10 text-white shadow-2xl">
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
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-[#8a3ffc] to-[#522696] text-white rounded-md hover:opacity-90 transition-opacity shadow-[0px_0px_15px_rgba(138,63,252,0.4)]"
          >
            {loading ? "Sending Invitation..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};