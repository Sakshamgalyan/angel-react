
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lock, LogOut } from "lucide-react";

export default function WarningPage() {
  const router = useRouter();
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [logoutCount, setLogoutCount] = useState<number>(120);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/auth/status");
        if (res.ok) {
          const data = await res.json();
          if (data.lockedAt) {
            setLockedAt(data.lockedAt);
          }
        }
      } catch (error) {
        console.error("Failed to fetch status", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoutCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Lock Countdown Effect
  useEffect(() => {
    if (!lockedAt) return;

    const interval = setInterval(() => {
      const lockTime = new Date(lockedAt).getTime();
      const unlockTime = lockTime + 24 * 60 * 60 * 1000; // 24 hours later
      const now = new Date().getTime();
      const diff = unlockTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        // Optionally refresh or check status again if lock should expire automatically
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedAt]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" }); // Assuming POST, usually standard for actions
      // Or GET if implemented that way. I'll stick to likely expectation or check but GET/POST usually safe to try fetch.
      // Most auth logout APIs are POST or GET. I'll try POST.
      window.location.href = "/auth";
    } catch (error) {
      console.error("Logout failed", error);
      window.location.href = "/auth";
    }
  };

  const formatLogoutTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="max-w-md w-full bg-zinc-900 border border-red-900/30 rounded-2xl shadow-2xl p-8 text-center space-y-6 relative overflow-hidden">

        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600"></div>

        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-900/20 p-4 ring-1 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
          Account Locked
        </h1>

        <div className="space-y-4">
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl">
            <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Security Alert</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We detected multiple failed login attempts with incorrect Angel One credentials. For your security, your account has been temporarily locked.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 py-2">
            <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Unlocks In</span>
            <span className="text-4xl font-mono font-bold text-white tracking-widest tabular-nums">
              {timeLeft || "--:--:--"}
            </span>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 mt-6">
          <p className="text-yellow-500/90 text-sm font-medium mb-4 flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Auto-logout in {formatLogoutTime(logoutCount)}
          </p>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-xl transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 group"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}