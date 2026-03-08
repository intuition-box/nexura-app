"use client";

import { Card } from "../../components/ui/card";
import { TASKS } from "../../types/admin";

export const StatsOverview = ({ tasks }: { tasks: TASKS[] }) => {
    const totalPending = tasks.filter(task => task.status === "pending").length;
    const approvedToday = tasks.filter(task => task.status === "done").length;
    // Count total historical rejections (includes tasks later re-approved)
    const rejectedToday = tasks.reduce((sum, task) => sum + ((task as any).rejectedCount || (task.status === "retry" ? 1 : 0)), 0);
    const totalProcessed = approvedToday + rejectedToday;
    const totalSubmissions = tasks.length;

    const pendingChange = totalProcessed > 0 ? `${Math.round((totalPending / (totalPending + totalProcessed)) * 100)}%` : "0%";
    const approvedChange = totalProcessed > 0 ? `${Math.round((approvedToday / totalProcessed) * 100)}%` : "0%";
    const rejectedChange = totalProcessed > 0 ? `${Math.round((rejectedToday / totalProcessed) * 100)}%` : "0%";

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
          <div className="flex flex-col relative z-10 pr-20">
            <span className="text-white/80 text-sm font-medium">Total Pending Today</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{totalPending}</span>
              <span className="text-white/70 text-xs font-medium">{pendingChange} pending</span>
            </div>
          </div>
          <img src="/total-pending.png" alt="Pending" className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 object-contain opacity-30 group-hover:opacity-50 transition-opacity" />
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
          <div className="flex flex-col relative z-10 pr-20">
            <span className="text-white/80 text-sm font-medium">Total Approved Today</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{approvedToday}</span>
              <span className="text-white/70 text-xs font-medium">{approvedChange} approval rate</span>
            </div>
          </div>
          <img src="/approved.png" alt="Approved" className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 object-contain opacity-30 group-hover:opacity-50 transition-opacity" />
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
          <div className="flex flex-col relative z-10 pr-20">
            <span className="text-white/80 text-sm font-medium">Total Rejected Today</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{rejectedToday}</span>
              <span className="text-white/70 text-xs font-medium">{rejectedChange} rejection rate</span>
            </div>
          </div>
          <img src="/rejected.png" alt="Rejected" className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 object-contain opacity-30 group-hover:opacity-50 transition-opacity" />
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
          <div className="flex flex-col relative z-10 pr-20">
            <span className="text-white/80 text-sm font-medium">Total Submissions</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{totalSubmissions}</span>
              <span className="text-white/70 text-xs font-medium">All time submissions</span>
            </div>
          </div>
          <img src="/approved.png" alt="Submissions" className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 object-contain opacity-30 group-hover:opacity-50 transition-opacity" />
        </Card>
      </div>
    );
  };