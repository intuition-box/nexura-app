"use client";

import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ManageAdminModal } from "../../components/ManageAdminModal";
import { AddAdminModal } from "../../components/AddAdminModal";
import { getStoredAdminInfo } from "../../lib/config";
import { projectApiRequest } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";
import StudioSidebar from "../../pages/studio/StudioSidebar";

export type AdminType = {
  _id: string;
  username: string;
  email?: string;
  role: "Super Admin" | "Admin" | "Moderator";
  lastActivity: string;
};

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const currentAdmin = getStoredAdminInfo();

  const handleRemoveAdmin = async (id: string) => {
    setRemovingId(id);
    try {
      await projectApiRequest({ method: "DELETE", endpoint: "/project/remove-admin", params: { id } });
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast({ title: "Admin removed", description: "The admin has been removed from your hub." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove admin.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <StudioSidebar
        activeTab="adminManagement"
        setActiveTab={(tab) => {
          if (tab === "campaignSubmissions") setLocation("/studio-dashboard");
          if (tab === "adminManagement") setLocation("/studio-dashboard/admin-management");
        }}
      />

      {/* Main content */}
<div className="flex-1 p-6 space-y-6">
  {/* Header: Title + Add Admin button */}
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold text-white">Admin Management</h2>
    <AddAdminModal
      onSuccess={() => {
        toast({ title: "Invite sent!", description: "The admin will receive an OTP to sign up." });
      }}
    >
      <Button
        variant="outline"
        className="border-[#8a3ffc] text-[#8a3ffc] hover:bg-[#8a3ffc] hover:text-white gap-2"
      >
        Add Admin
      </Button>
    </AddAdminModal>
  </div>

  {/* Three Horizontal Cards */}
  <div className="flex gap-6">
    {/* Card 1 */}
    <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-start gap-4 border-2 border-white">
      <img src="/admin.png" alt="Icon 1" className="w-10 h-10 object-contain" />
      <div className="flex flex-col">
        <h4 className="text-lg font-semibold text-white">Total Admins</h4>
        <p className="text-white/70 text-xl">{admins.length}</p>
      </div>
    </div>

    {/* Card 2 */}
    <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-start gap-4 border-2 border-white">
      <img src="/approved.png" alt="Icon 2" className="w-10 h-10 object-contain" />
      <div className="flex flex-col">
        <h4 className="text-lg font-semibold text-white">Active Admins</h4>
        <p className="text-white/70 text-xl">{admins.length}</p>
      </div>
    </div>

    {/* Card 3 */}
    <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-start gap-4 border-2 border-white">
      <img src="/total-pending.png" alt="Icon 3" className="w-10 h-10 object-contain" />
      <div className="flex flex-col">
        <h4 className="text-lg font-semibold text-white">Pending Invites</h4>
        <p className="text-white/70 text-xl">—</p>
      </div>
    </div>
  </div>

<div className="flex items-center justify-between mb-6">
  {/* Title */}
  <h2 className="text-2xl font-bold text-white">Manage Admins</h2>

  {/* Search Bar */}
  <div className="relative w-64">
    <input
      type="text"
      placeholder="Search"
      className="w-full pl-4 pr-10 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#8a3ffc]"
    />
    {/* Search Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
  </div>
</div>

        {
          <Card className="bg-white/5 border-white/10 backdrop-blur-[125px] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Administrator</TableHead>
                  <TableHead className="text-white/70">Role</TableHead>
                  <TableHead className="text-white/70">Last Activity</TableHead>
                  <TableHead className="text-white/70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[currentAdmin, ...admins]
                  .filter((admin): admin is AdminType => !!admin)
                  .map((admin) => (
                    <TableRow key={admin._id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        <div>{admin.username}</div>
                        {admin.email && <div className="text-white/60 text-sm">{admin.email}</div>}
                      </TableCell>
                      <TableCell className="text-white/80">{admin.role}</TableCell>
                      <TableCell className="text-white/80">{admin.lastActivity}</TableCell>
                      <TableCell className="text-right">
                        {admin._id !== currentAdmin?._id && currentAdmin?.role === "Super Admin" && (
                          <ManageAdminModal
                            name={admin.username}
                            role={admin.role}
                            onSuccess={() => handleRemoveAdmin(admin._id)}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                              disabled={removingId === admin._id}
                            >
                              {removingId === admin._id
                                ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Removing...</>
                                : "Manage"}
                            </Button>
                          </ManageAdminModal>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {admins.length === 0 && !currentAdmin && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-white/40 py-10">No administrators found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        }
      </div>
    </div>
  );
}
