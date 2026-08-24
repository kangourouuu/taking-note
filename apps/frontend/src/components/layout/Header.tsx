import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { User, LogOut, ChevronDown, Calendar } from "lucide-react";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { activeMonth } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatMonthTitle = (monthStr: string): string => {
    const [year, month] = monthStr.split("-");
    if (!year || !month) return monthStr;
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
            N
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-950">Taking Note</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-900 font-semibold text-base sm:text-lg">
          <Calendar className="w-5 h-5 text-zinc-500" />
          <span>{formatMonthTitle(activeMonth)}</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-sm font-medium text-zinc-800 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-zinc-700" />
            </div>
            <span>{user?.username}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-40">
              <div className="px-3 py-2 border-b border-zinc-100">
                <p className="text-xs text-zinc-400">Signed in as</p>
                <p className="text-sm font-semibold text-zinc-900 truncate">{user?.username}</p>
              </div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
