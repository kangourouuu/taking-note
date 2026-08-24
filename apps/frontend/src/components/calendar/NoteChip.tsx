import React from "react";
import { NoteResponseDto } from "@taking-note/shared";
import { useApp } from "../../context/AppContext";

interface NoteChipProps {
  note: NoteResponseDto;
}

export const NoteChip: React.FC<NoteChipProps> = ({ note }) => {
  const { openNoteModal } = useApp();

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    openNoteModal(note.noteDate, note);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-md p-1.5 shadow-xs cursor-pointer transition-all duration-150 text-left overflow-hidden"
    >
      <div className="flex items-center gap-1.5 mb-1">
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="w-2 h-2 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: tag.colorHex }}
                title={tag.name}
              />
            ))}
          </div>
        )}
        <h4 className="text-xs font-semibold text-zinc-900 truncate leading-tight flex-1">
          {note.title}
        </h4>
      </div>

      {note.summary && (
        <p className="text-[11px] text-zinc-500 truncate leading-tight">
          {note.summary}
        </p>
      )}
    </div>
  );
};
