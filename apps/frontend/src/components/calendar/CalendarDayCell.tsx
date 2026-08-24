import React from "react";
import { NoteResponseDto } from "@taking-note/shared";
import { useApp } from "../../context/AppContext";
import { NoteChip } from "./NoteChip";

interface CalendarDayCellProps {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  notes: NoteResponseDto[];
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  dateStr,
  dayNumber,
  isCurrentMonth,
  isToday,
  notes
}) => {
  const { openNoteModal, selectedTagIds } = useApp();

  const visibleNotes = selectedTagIds.length === 0
    ? notes
    : notes.filter((n) => n.tags.some((t) => selectedTagIds.includes(t.id)));

  const handleCellClick = (): void => {
    openNoteModal(dateStr, null);
  };

  return (
    <div
      onClick={handleCellClick}
      className={`h-[135px] sm:h-[155px] md:h-[170px] border-b border-r border-zinc-200 p-2 flex flex-col transition-colors cursor-pointer group overflow-hidden ${
        isCurrentMonth ? "bg-white hover:bg-zinc-50/70" : "bg-zinc-50/50 text-zinc-400"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <span
          className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
            isToday
              ? "bg-black text-white"
              : isCurrentMonth
              ? "text-zinc-800 group-hover:text-black"
              : "text-zinc-400"
          }`}
        >
          {dayNumber}
        </span>

        <div className="flex items-center gap-1">
          {visibleNotes.length > 2 && (
            <span className="text-[10px] text-zinc-400 font-medium px-1 bg-zinc-100 rounded">
              {visibleNotes.length} notes
            </span>
          )}
          {isToday && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-black bg-zinc-100 px-1.5 py-0.5 rounded">
              Today
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 flex flex-col gap-1.5">
        {visibleNotes.map((note) => (
          <NoteChip key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
};
