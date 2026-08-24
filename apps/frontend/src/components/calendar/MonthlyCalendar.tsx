import React, { useMemo } from "react";
import { DAYS_OF_WEEK, NoteResponseDto } from "@taking-note/shared";
import { useApp } from "../../context/AppContext";
import { CalendarDayCell } from "./CalendarDayCell";
import { FolderPlus } from "lucide-react";

interface DayData {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const MonthlyCalendar: React.FC = () => {
  const { activeMonth, notes, activeProject, openProjectModal } = useApp();

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const daysGrid = useMemo<DayData[]>(() => {
    const [yearNum, monthNum] = activeMonth.split("-").map(Number);
    if (!yearNum || !monthNum) return [];

    const firstDayDate = new Date(yearNum, monthNum - 1, 1);
    const dayOfWeek = firstDayDate.getDay();
    const mondayOffset = (dayOfWeek + 6) % 7;

    const daysInCurrentMonth = new Date(yearNum, monthNum, 0).getDate();
    const daysInPrevMonth = new Date(yearNum, monthNum - 1, 0).getDate();

    const days: DayData[] = [];

    const prevMonthNum = monthNum === 1 ? 12 : monthNum - 1;
    const prevYearNum = monthNum === 1 ? yearNum - 1 : yearNum;
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateStr = `${prevYearNum}-${String(prevMonthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    const nextMonthNum = monthNum === 12 ? 1 : monthNum + 1;
    const nextYearNum = monthNum === 12 ? yearNum + 1 : yearNum;
    const remaining = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const dateStr = `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    return days;
  }, [activeMonth, todayStr]);

  const notesByDate = useMemo(() => {
    const map = new Map<string, NoteResponseDto[]>();
    for (const note of notes) {
      const dateKey = note.noteDate ? (note.noteDate.split("T")[0] ?? note.noteDate) : "";
      const list = map.get(dateKey) ?? [];
      list.push(note);
      map.set(dateKey, list);
    }
    return map;
  }, [notes]);

  if (!activeProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-6 h-6 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Create Your First Project</h3>
          <p className="text-sm text-zinc-500 mb-6">
            You must create at least one project to start organizing notes on your calendar.
          </p>
          <button
            onClick={openProjectModal}
            className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border-t border-l border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-center">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="py-2.5 text-xs font-bold tracking-wider text-zinc-600 border-r border-zinc-200"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[180px]">
          {daysGrid.map((day) => (
            <CalendarDayCell
              key={day.dateStr}
              dateStr={day.dateStr}
              dayNumber={day.dayNumber}
              isCurrentMonth={day.isCurrentMonth}
              isToday={day.isToday}
              notes={notesByDate.get(day.dateStr) ?? []}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
