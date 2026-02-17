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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { UserPlus } from "lucide-react";

interface AddAdminModalProps {
  children?: React.ReactNode;
  onSuccess?: (newAdmin: {
    _id: string;
    username: string;
    email?: string;
    role: "Super Admin" | "Admin" | "Moderator";
    lastActivity: string;
  }) => void;
}

export function AddAdminModal({ children, onSuccess }: AddAdminModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const emailPattern = /^[\w.-]+@(gmail|yahoo)\.com$/i;

    if (!formData.name || !formData.email || !formData.role) return;
    if (!emailPattern.test(formData.email)) {
      alert("Please enter a valid Gmail or Yahoo email.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // local date and time for lastActivity
      const now = new Date();
      const lastActivity = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newAdmin = {
        _id: Date.now().toString(),
        username: formData.name,
        email: formData.email,
        role:
          formData.role === "super_admin"
            ? "Super Admin"
            : formData.role === "admin"
            ? "Admin"
            : "Moderator",
        lastActivity,
      };

      onSuccess?.(newAdmin); // immediately add to table
      setFormData({ name: "", email: "", role: "" }); // reset form
      setOpen(false);
      setLoading(false);
    }, 500); // simulate network delay
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
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white/70">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#8a3ffc]"
              required
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white/70">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@gmail.com or name@yahoo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#8a3ffc]"
              required
            />
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-white/70">
              Role Permission
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#8a3ffc]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem
                  value="super_admin"
                  className="focus:bg-white/10 focus:text-white"
                >
                  Super Admin
                </SelectItem>
                <SelectItem
                  value="admin"
                  className="focus:bg-white/10 focus:text-white"
                >
                  Admin
                </SelectItem>
                <SelectItem
                  value="moderator"
                  className="focus:bg-white/10 focus:text-white"
                >
                  Moderator
                </SelectItem>
              </SelectContent>
            </Select>
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