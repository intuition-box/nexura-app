"use client";

import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ManageAdminModal } from "../../components/ManageAdminModal";
import { AddAdminModal } from "../../components/AddAdminModal";
import { getStoredAdminInfo } from "../../lib/config";
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
  const [loading, setLoading] = useState(true);

  const currentAdmin = getStoredAdminInfo();

  // Frontend-only fetch simulation
  useEffect(() => {
    setTimeout(() => {
      setAdmins([
        { _id: "1", username: "alice", email: "alice@example.com", role: "Admin", lastActivity: "2026-02-17 10:00" },
        { _id: "2", username: "bob", email: "bob@example.com", role: "Moderator", lastActivity: "2026-02-16 14:30" },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Frontend-only "add admin"
  const handleAddAdmin = (newAdmin: AdminType) => {
    setAdmins((prev) => [newAdmin, ...prev]);
  };

  // Frontend-only "manage admin" (role update)
  const handleUpdateAdmin = (id: string, updatedRole: AdminType["role"]) => {
    setAdmins((prev) =>
      prev.map((admin) => (admin._id === id ? { ...admin, role: updatedRole } : admin))
    );
  };

  // Frontend-only "remove admin"
  const handleRemoveAdmin = (id: string) => {
    setAdmins((prev) => prev.filter((admin) => admin._id !== id));
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <StudioSidebar
        activeTab="adminManagement"
        setActiveTab={(tab) => {
          if (tab === "dashboard") setLocation("/studio-dashboard");
          if (tab === "adminManagement") setLocation("/studio-dashboard/admin-management");
        }}
      />

      {/* Main content */}
<div className="flex-1 p-6 space-y-6">
  {/* Header: Title + Add Admin button */}
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold text-white">Admin Management</h2>
    <AddAdminModal
      onSuccess={(admin) => {
        handleAddAdmin(admin);
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
        <p className="text-white/70 text-xl">5</p>
      </div>
    </div>

    {/* Card 2 */}
    <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-start gap-4 border-2 border-white">
      <img src="/approved.png" alt="Icon 2" className="w-10 h-10 object-contain" />
      <div className="flex flex-col">
        <h4 className="text-lg font-semibold text-white">Active Admins</h4>
        <p className="text-white/70 text-xl">3</p>
      </div>
    </div>

    {/* Card 3 */}
    <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-start gap-4 border-2 border-white">
      <img src="/total-pending.png" alt="Icon 3" className="w-10 h-10 object-contain" />
      <div className="flex flex-col">
        <h4 className="text-lg font-semibold text-white">Pending Invites</h4>
        <p className="text-white/70 text-xl">5</p>
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

        {loading ? (
          <div className="flex items-center justify-center py-12 text-white/60">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading administrators...
          </div>
        ) : (
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
                            onSuccess={(updatedRole) => handleUpdateAdmin(admin._id, updatedRole)}
                            onRemove={() => handleRemoveAdmin(admin._id)}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              Manage
                            </Button>
                          </ManageAdminModal>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
