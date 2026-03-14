"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ManageAdminModal } from "../../components/ManageAdminModal";
import { AddAdminModal } from "../../components/AddAdminModal";
import { getStoredProjectInfo } from "../../lib/projectApi";
import { projectApiRequest } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";

export type AdminType = {
  _id: string;
  name: string;
  email?: string;
  role: "superadmin" | "admin";
  createdAt?: string;
};

type PendingInvite = {
  _id: string;
  email: string;
  role: string;
  createdAt?: string;
  expiresAt?: string;
};

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null);
  const { toast } = useToast();

  const info = getStoredProjectInfo();
  const currentAdminId = (info?.adminId ?? "") as string;
  const currentRole = (info?.role ?? "admin") as string;
  const isSuperAdmin = currentRole === "superadmin";

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectApiRequest<{ admins?: AdminType[]; pendingInvites?: PendingInvite[] }>({
        method: "GET",
        endpoint: "/hub/hub-admins",
      });
      setAdmins(res.admins ?? []);
      setPendingInvites(res.pendingInvites ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load admins.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleRemoveAdmin = async (id: string) => {
    setRemovingId(id);
    try {
      await projectApiRequest({ method: "DELETE", endpoint: "/hub/remove-admin", params: { id } });
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast({ title: "Admin removed", description: "The admin has been removed from your hub." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove admin.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    setResendingId(inviteId);
    try {
      await projectApiRequest({
        method: "POST",
        endpoint: "/hub/resend-invite",
        data: { inviteId, clientUrl: window.location.origin },
      });
      toast({ title: "Invite resent", description: "A new OTP has been sent to the invitee." });
      fetchAdmins();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend invite.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    setDeletingInviteId(inviteId);
    try {
      await projectApiRequest({ method: "DELETE", endpoint: "/hub/delete-invite", params: { id: inviteId } });
      setPendingInvites((prev) => prev.filter((i) => i._id !== inviteId));
      toast({ title: "Invite deleted", description: "The pending invite has been removed." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete invite.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeletingInviteId(null);
    }
  };

  const formatRole = (role: string) => role === "superadmin" ? "Super Admin" : "Admin";

  const filteredAdmins = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const superAdminCount = admins.filter((a) => a.role === "superadmin").length;

  return (
    <div className="space-y-6">
      {/* Header: Title + Add Admin button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Admin Management</h2>
        {isSuperAdmin && (
          <AddAdminModal onSuccess={fetchAdmins}>
            <Button
              variant="outline"
              className="border-[#8B3EFE] text-[#8B3EFE] hover:bg-[#8B3EFE] hover:text-white gap-2"
            >
              Add Admin
            </Button>
          </AddAdminModal>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex-1 bg-white/[0.06] backdrop-blur-xl rounded-xl p-4 flex items-start gap-4 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-white/20 transition-all duration-200">
          <img src="/admin.png" alt="Total" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-white">Total Admins</h4>
            <p className="text-white/70 text-xl">{admins.length}</p>
          </div>
        </div>
        <div className="flex-1 bg-white/[0.06] backdrop-blur-xl rounded-xl p-4 flex items-start gap-4 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-white/20 transition-all duration-200">
          <img src="/approved.png" alt="Super Admins" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-white">Super Admins</h4>
            <p className="text-white/70 text-xl">{superAdminCount}</p>
          </div>
        </div>
        <div className="flex-1 bg-white/[0.06] backdrop-blur-xl rounded-xl p-4 flex items-start gap-4 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-white/20 transition-all duration-200">
          <img src="/total-pending.png" alt="Pending" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-white">Pending Invites</h4>
            <p className="text-white/70 text-xl">{pendingInvites.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Manage Admins</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#8a3ffc]"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </div>
      </div>

      {/* Admin Table */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-[125px] overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/70">Administrator</TableHead>
              <TableHead className="text-white/70">Role</TableHead>
              <TableHead className="text-white/70">Joined</TableHead>
              <TableHead className="text-white/70 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-white/40 py-10">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredAdmins.map((admin) => {
              const isCurrentUser = admin._id === currentAdminId;
              return (
                <TableRow key={admin._id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      {admin.name}
                      {isCurrentUser && (
                        <span className="text-xs text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                    {admin.email && <div className="text-white/60 text-sm">{admin.email}</div>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      admin.role === "superadmin"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {formatRole(admin.role)}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/80">
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isCurrentUser && isSuperAdmin && (
                      <ManageAdminModal
                        adminId={admin._id}
                        name={admin.name}
                        email={admin.email}
                        role={admin.role}
                        onSuccess={fetchAdmins}
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
              );
            })}
            {!loading && filteredAdmins.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-white/40 py-10">No administrators found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-white mt-4">Pending Invites</h3>
          <Card className="bg-white/5 border-white/10 backdrop-blur-[125px] overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Email</TableHead>
                  <TableHead className="text-white/70">Invited Role</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  {isSuperAdmin && <TableHead className="text-white/70 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite._id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">{invite.email}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        invite.role === "superadmin"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {invite.role === "superadmin" ? "Super Admin" : "Admin"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50 gap-1"
                            disabled={resendingId === invite._id}
                            onClick={() => handleResendInvite(invite._id)}
                          >
                            {resendingId === invite._id
                              ? <><Loader2 className="w-3 h-3 animate-spin" />Sending...</>
                              : <><RefreshCw className="w-3 h-3" />Resend</>}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 gap-1"
                            disabled={deletingInviteId === invite._id}
                            onClick={() => handleDeleteInvite(invite._id)}
                          >
                            {deletingInviteId === invite._id
                              ? <><Loader2 className="w-3 h-3 animate-spin" />Deleting...</>
                              : <><Trash2 className="w-3 h-3" />Delete</>}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
