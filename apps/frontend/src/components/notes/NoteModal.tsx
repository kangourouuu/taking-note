import React, { useState, useEffect, FormEvent } from "react";
import { useApp } from "../../context/AppContext";
import { notesApi } from "../../api/notes";
import { X, Trash2, Calendar, Check } from "lucide-react";

export const NoteModal: React.FC = () => {
  const {
    isNoteModalOpen,
    closeNoteModal,
    editingNote,
    selectedNoteDate,
    activeProject,
    tags,
    refreshNotes
  } = useApp();

  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [noteDate, setNoteDate] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setSummary(editingNote.summary ?? "");
      setContent(editingNote.content);
      setNoteDate(editingNote.noteDate);
      setSelectedTagIds(editingNote.tags.map((t) => t.id));
    } else {
      setTitle("");
      setSummary("");
      setContent("");
      setNoteDate(selectedNoteDate ?? new Date().toISOString().split("T")[0] ?? "");
      setSelectedTagIds([]);
    }
    setError(null);
  }, [editingNote, selectedNoteDate, isNoteModalOpen]);

  if (!isNoteModalOpen) return null;

  const toggleTag = (tagId: string): void => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!activeProject) {
      setError("Please select a project first");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, {
          title,
          summary: summary.trim().length > 0 ? summary : undefined,
          content,
          noteDate,
          tagIds: selectedTagIds
        });
      } else {
        await notesApi.create({
          projectId: activeProject.id,
          title,
          summary: summary.trim().length > 0 ? summary : undefined,
          content,
          noteDate,
          tagIds: selectedTagIds
        });
      }

      await refreshNotes();
      closeNoteModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save note");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!editingNote) return;
    setIsSubmitting(true);
    try {
      await notesApi.delete(editingNote.id);
      await refreshNotes();
      closeNoteModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete note");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <button
          onClick={closeNoteModal}
          className="absolute right-4 top-4 text-zinc-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-950">
            {editingNote ? "Note Details" : "Create Note"}
          </h2>
          <p className="text-xs text-zinc-500">
            {activeProject ? `Project: ${activeProject.name}` : ""}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Subtitle / Summary (Chip Preview)
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief subtitle or summary displayed on calendar chip..."
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Assign Tags
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-zinc-200 rounded-lg bg-zinc-50">
                {tags.length === 0 ? (
                  <span className="text-xs text-zinc-400 italic">No tags available</span>
                ) : (
                  tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-all ${
                          isSelected
                            ? "bg-white border-zinc-900 text-zinc-900 shadow-xs"
                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: tag.colorHex }}
                        />
                        <span>{tag.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-black" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Note Content
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write full note content here..."
              className="w-full flex-1 px-3.5 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none min-h-[140px]"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
            {editingNote ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Note</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeNoteModal}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-black rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingNote ? "Save Changes" : "Create Note"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
