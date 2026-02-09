import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Check, Flame, ChevronLeft, ChevronRight } from "lucide-react";

interface DailyCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckInSuccess: () => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DailyCheckInModal({ open, onOpenChange, onCheckInSuccess }: DailyCheckInModalProps) {
  const [checkInDates, setCheckInDates] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [serverDate, setServerDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchHistory();
      const now = new Date();
      setViewMonth(now.getMonth());
      setViewYear(now.getFullYear());
    }
  }, [open]);

  useEffect(() => {
    if (justClaimed) {
      const timer = setTimeout(() => setJustClaimed(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [justClaimed]);

  const fetchHistory = async () => {
    setIsFetching(true);
    try {
      const response = await apiRequest("GET", "/api/user/check-in-history");
      const data = await response.json();
      setCheckInDates(data.checkInDates || []);
      setStreak(data.streak || 0);
      setLongestStreak(data.longestStreak || 0);
      setAlreadyCheckedIn(data.alreadyCheckedIn || false);
      setServerDate(data.serverDate || new Date().toISOString().split("T")[0]);
    } catch {
      // silently fail
    } finally {
      setIsFetching(false);
    }
  };

  const handleCheckIn = async () => {
    if (alreadyCheckedIn || isLoading) return;
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/user/perform-daily-sign-in");
      setAlreadyCheckedIn(true);
      setJustClaimed(true);
      setStreak((s) => s + 1);
      const today = serverDate || new Date().toISOString().split("T")[0];
      setCheckInDates((prev) => [...prev, today]);
      toast({ title: "Check-in complete!", description: "+5 XP earned" });
      onCheckInSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to check in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const today = serverDate || new Date().toISOString().split("T")[0];
  const checkInSet = useMemo(() => new Set(checkInDates), [checkInDates]);

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const isCurrentMonth = viewMonth === new Date().getMonth() && viewYear === new Date().getFullYear();

  const canGoNext = !isCurrentMonth;

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (canGoNext) {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 rounded-3xl max-w-md p-0 overflow-hidden bg-[#0a0a1a]/95 backdrop-blur-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <img src="/daily.png" alt="" className="w-6 h-6" />
              Daily Check-In
            </DialogTitle>
            <DialogDescription className="text-white/50 text-sm">
              Check in every day to keep your streak alive
            </DialogDescription>
          </DialogHeader>

          {/* Streak badges */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 glass rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-white/50 font-medium">Current</span>
              </div>
              <span className="text-2xl font-bold text-white">{streak}</span>
              <span className="text-xs text-white/40 ml-1">days</span>
            </div>
            <div className="flex-1 glass rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-sm">🏆</span>
                <span className="text-xs text-white/50 font-medium">Best</span>
              </div>
              <span className="text-2xl font-bold text-white">{longestStreak}</span>
              <span className="text-xs text-white/40 ml-1">days</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="px-6 py-3">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext}
              className={`p-1.5 rounded-lg transition-colors ${canGoNext ? "hover:bg-white/10 text-white/60 hover:text-white" : "text-white/20 cursor-not-allowed"}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-white/30 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }

              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === today;
              const isCheckedIn = checkInSet.has(dateStr);
              const isFuture = dateStr > today;

              return (
                <div
                  key={dateStr}
                  className={`aspect-square rounded-xl flex items-center justify-center relative text-xs font-medium transition-all duration-200
                    ${isFuture ? "text-white/15" : "text-white/60"}
                    ${isToday && !isCheckedIn ? "ring-1 ring-orange-400/40" : ""}
                    ${isCheckedIn && !isToday ? "bg-purple-500/15 text-purple-300" : ""}
                    ${isCheckedIn && isToday ? "bg-orange-500/15" : ""}
                  `}
                >
                  {/* Flame for today */}
                  {isToday && (
                    <div className={`absolute inset-0 flex items-center justify-center ${justClaimed ? "animate-bounce" : ""}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-transparent rounded-xl" />
                      <Flame
                        className={`w-5 h-5 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all duration-300 ${
                          alreadyCheckedIn ? "text-orange-400" : "text-orange-400/50 animate-pulse"
                        }`}
                      />
                      {alreadyCheckedIn && (
                        <Check className="w-2.5 h-2.5 text-white absolute bottom-0.5 right-0.5" />
                      )}
                    </div>
                  )}
                  {/* Check mark for past check-ins */}
                  {isCheckedIn && !isToday && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  )}
                  {/* Day number */}
                  {!isToday && !isCheckedIn && <span>{day}</span>}
                  {isToday && !alreadyCheckedIn && !isCheckedIn && (
                    <span className="sr-only">{day}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Check-in button */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={handleCheckIn}
            disabled={alreadyCheckedIn || isLoading || isFetching}
            className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
              alreadyCheckedIn
                ? "bg-white/5 border border-white/10 text-white/40 cursor-default"
                : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_32px_rgba(249,115,22,0.5)] active:scale-[0.98]"
            }`}
          >
            {isFetching
              ? "Loading..."
              : isLoading
                ? "Checking in..."
                : alreadyCheckedIn
                  ? "Checked in today ✓"
                  : "Check In (+5 XP)"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
