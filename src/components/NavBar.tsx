"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { toggleTheme } from "@/store/slices/themeSlice";
import { Moon, Sun, User } from "lucide-react";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppDispatch } from "@/store";

const NavBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logoutUser());
    setIsLoggingOut(false);
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 transition-colors">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          RevenceX
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <Sun className="w-5 h-5 dark:hidden" />
            <Moon className="w-5 h-5 hidden dark:block" />
          </button>

          {/* Profile icon */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center text-black dark:text-slate-300 hover:bg-red-600 transition-all p-2 px-4 rounded-md bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>

          {/* User info */}
          <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 pl-4 text-right">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {user?.name || "Name"}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {user?.role || "Role"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
