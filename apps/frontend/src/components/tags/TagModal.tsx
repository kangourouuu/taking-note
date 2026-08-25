import React, { useState, useEffect, FormEvent } from "react";
import { useApp } from "../../context/AppContext";
import { tagsApi } from "../../api/tags";
import { TagColorPicker } from "./TagColorPicker";
import { X, Trash2 } from "lucide-react";

export const TagModal: React.FC = () => {
  const { isTagModalOpen, closeTagModal, editingTag, activeProject, refreshTags, refreshNotes } = useApp();

  const [name, setName] = useState<string>("");
  const [colorHex, setColorHex] = useState<string>("#3B82F6");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTag) {
      setName(editingTag.name);
      setColorHex(editingTag.colorHex);
    } else {
      setName("");
      setColorHex("#3B82F6");
    }
    setError(null);
  }, [editingTag, isTagModalOpen]);

  if (!isTagModalOpen) return null;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!activeProject) {
      setError("Please select a project first to create a tag");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (editingTag) {
        await tagsApi.update(editingTag.id, {
          name,
          colorHex,
          projectId: activeProject.id
        });
      } else {
        await tagsApi.create({
          name,
          colorHex,
          projectId: activeProject.id
        });
      }

      await refreshTags();
      await refreshNotes();
      closeTagModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save tag");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!editingTag) return;
    setIsSubmitting(true);
    try {
      await tagsApi.delete(editingTag.id);
      await refreshTags();
      await refreshNotes();
      closeTagModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete tag");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={closeTagModal}
          className="absolute right-4 top-4 text-zinc-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-zinc-950 mb-1">
          {editingTag ? "Edit Tag" : "Create New Tag"}
        </h2>
        <p className="text-xs text-zinc-500 mb-5">
          {activeProject ? `Project: ${activeProject.name}` : "Select a project to manage tags"}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Tag Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Urgent, Work, Ideas"
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
              Tag Color & Tone
            </label>
            <TagColorPicker value={colorHex} onChange={setColorHex} />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {editingTag ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeTagModal}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-black rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingTag ? "Update Tag" : "Create Tag"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
