# PHASE 4: FRONTEND CALENDAR-FIRST APP & MINIMALIST UI

---

## 1. OBJECTIVE
Implement the minimalist, calendar-first React + Vite frontend with a Monday-first monthly grid, locked row heights, uncollapsed note chips (`shrink-0`), contained inside-cell scrolling, in-place dropdown creation triggers, and tag color tone selector.

---

## 2. ACCEPTANCE CRITERIA (ACs)

- [ ] **AC-4.1**: **Monday-First Monthly Grid**:
  - Full 5-to-6 week calendar grid with columns starting strictly on Monday (`MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, `SUN`).
  - Active month dates prominently displayed; previous and next month adjacent days subtly rendered.
  - Real-time today indicator badge.
- [ ] **AC-4.2**: **Locked Grid Rows & Inside Cell Scrolling**:
  - Grid rows locked via `auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[180px]`.
  - Date cells contain `flex-1 min-h-0 overflow-y-auto cell-scroll overscroll-contain` so that notes scroll cleanly inside the cell when overflowing.
  - Note chips have `shrink-0 w-full` to prevent flex squishing.
  - Note count badge (e.g. `3 notes`) displayed when notes exceed 2 in a cell.
- [ ] **AC-4.3**: **Calendar-Driven Note Creation & Detail**:
  - Clicking any date cell opens the note creation modal prefilled with that clicked date.
  - Clicking an existing note chip opens the note detail/edit modal with delete capability.
- [ ] **AC-4.4**: **Dropdown Creation Triggers**:
  - Project selector dropdown contains user projects with `[+ Create New Project...]` anchored at the bottom.
  - Tag selector dropdown contains multi-select tag filters with `[+ Create New Tag...]` anchored at the bottom.
- [ ] **AC-4.5**: **Tag Tone Selector**:
  - Custom color picker offering 11 curated tone swatches alongside a native HTML5 hex picker.
- [ ] **AC-4.6**: **Typography & Design Tokens**:
  - Pure black (`#000000`) and pure white (`#FFFFFF`) palette with neutral zinc grayscale accents.
  - Typography styled with `Be Vietnamese Pro` font.

---

## 3. EXPECTATIONS

- Filtering notes by project or tag toggles chip visibility without triggering calendar grid reflow or resizing.
- Scrolling inside any date cell does not scroll the parent window.
- Zero usage of `any` or `unknown` types.
- Zero comments in any implementation file.

---

## 4. VERIFICATION COMMANDS

```bash
# Run strict TypeScript verification on frontend
pnpm --filter frontend type-check

# Build frontend production bundle with Vite
pnpm --filter frontend build

# Run local preview server
pnpm --filter frontend preview
```

---

## 5. SKELETON OF IMPLEMENTATION

### Directory Structure
```
apps/frontend/src/
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── projects.ts
│   ├── tags.ts
│   └── notes.ts
├── components/
│   ├── auth/
│   │   └── AuthPage.tsx
│   ├── calendar/
│   │   ├── MonthlyCalendar.tsx
│   │   ├── CalendarDayCell.tsx
│   │   └── NoteChip.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── FilterBar.tsx
│   ├── notes/
│   │   └── NoteModal.tsx
│   ├── projects/
│   │   └── ProjectModal.tsx
│   └── tags/
│       ├── TagModal.tsx
│       └── TagColorPicker.tsx
├── context/
│   ├── AuthContext.tsx
│   └── AppContext.tsx
├── App.tsx
├── main.tsx
└── index.css
```

### Key Component Architectures

#### `src/components/calendar/MonthlyCalendar.tsx`
```tsx
export const MonthlyCalendar: React.FC = () => {
  const { activeMonth, notes, activeProject } = useApp();

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-zinc-50 text-center">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-2.5 text-xs font-bold text-zinc-600">{day}</div>
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
```

#### `src/components/calendar/CalendarDayCell.tsx` (Inside-Cell Scroll Container)
```tsx
export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  dateStr, dayNumber, isCurrentMonth, isToday, notes
}) => {
  const { openNoteModal, selectedTagIds } = useApp();

  const visibleNotes = selectedTagIds.length === 0
    ? notes
    : notes.filter((n) => n.tags.some((t) => selectedTagIds.includes(t.id)));

  return (
    <div
      onClick={() => openNoteModal(dateStr, null)}
      className="h-full w-full min-h-0 border-b border-r border-zinc-200 p-2 flex flex-col cursor-pointer overflow-hidden"
    >
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <span className={`text-xs font-semibold w-6 h-6 rounded-full inline-flex items-center justify-center ${isToday ? "bg-black text-white" : ""}`}>
          {dayNumber}
        </span>
        {visibleNotes.length > 2 && (
          <span className="text-[10px] text-zinc-400 font-medium px-1 bg-zinc-100 rounded">
            {visibleNotes.length} notes
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1.5 cell-scroll overscroll-contain">
        {visibleNotes.map((note) => (
          <NoteChip key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
};
```

#### `src/components/calendar/NoteChip.tsx` (Solid Non-Collapsing Chip)
```tsx
export const NoteChip: React.FC<{ note: NoteResponseDto }> = ({ note }) => {
  const { openNoteModal } = useApp();
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        openNoteModal(note.noteDate, note);
      }}
      className="shrink-0 w-full bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md p-1.5 shadow-xs cursor-pointer overflow-hidden"
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        {note.tags.map((tag) => (
          <span key={tag.id} className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.colorHex }} />
        ))}
        <h4 className="text-xs font-semibold text-zinc-900 truncate flex-1">{note.title}</h4>
      </div>
      {note.summary && <p className="text-[11px] text-zinc-500 truncate">{note.summary}</p>}
    </div>
  );
};
```
