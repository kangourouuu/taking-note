import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ProjectResponseDto, TagResponseDto, NoteResponseDto } from "@taking-note/shared";
import { projectsApi } from "../api/projects";
import { tagsApi } from "../api/tags";
import { notesApi } from "../api/notes";
import { useAuth } from "./AuthContext";

interface AppContextValue {
  projects: ProjectResponseDto[];
  activeProject: ProjectResponseDto | null;
  setActiveProject: (project: ProjectResponseDto | null) => void;
  tags: TagResponseDto[];
  selectedTagIds: string[];
  toggleTagFilter: (tagId: string) => void;
  clearTagFilters: () => void;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  notes: NoteResponseDto[];
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
  refreshTags: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  isProjectModalOpen: boolean;
  openProjectModal: () => void;
  closeProjectModal: () => void;
  isTagModalOpen: boolean;
  editingTag: TagResponseDto | null;
  openTagModal: (tag?: TagResponseDto | null) => void;
  closeTagModal: () => void;
  isNoteModalOpen: boolean;
  editingNote: NoteResponseDto | null;
  selectedNoteDate: string | null;
  openNoteModal: (date?: string, note?: NoteResponseDto | null) => void;
  closeNoteModal: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [activeProject, setActiveProjectState] = useState<ProjectResponseDto | null>(null);
  const [tags, setTags] = useState<TagResponseDto[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [activeMonth, setActiveMonth] = useState<string>(getCurrentMonthString());
  const [notes, setNotes] = useState<NoteResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState<boolean>(false);
  const [editingTag, setEditingTag] = useState<TagResponseDto | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<NoteResponseDto | null>(null);
  const [selectedNoteDate, setSelectedNoteDate] = useState<string | null>(null);

  const setActiveProject = useCallback((project: ProjectResponseDto | null): void => {
    setActiveProjectState(project);
    setSelectedTagIds([]);
  }, []);

  const refreshProjects = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
      if (data.length > 0) {
        setActiveProjectState((prev) => {
          if (!prev) return data[0] ?? null;
          const found = data.find((p) => p.id === prev.id);
          return found ?? data[0] ?? null;
        });
      } else {
        setActiveProjectState(null);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const refreshTags = useCallback(async (): Promise<void> => {
    if (!user) return;
    if (!activeProject) {
      setTags([]);
      return;
    }
    try {
      const data = await tagsApi.getAll(activeProject.id);
      setTags(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, activeProject]);

  const refreshNotes = useCallback(async (): Promise<void> => {
    if (!user || !activeProject) {
      setNotes([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await notesApi.getAll({
        projectId: activeProject.id,
        month: activeMonth
      });
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeProject, activeMonth]);

  useEffect(() => {
    if (user) {
      refreshProjects();
    } else {
      setProjects([]);
      setActiveProjectState(null);
      setTags([]);
      setNotes([]);
      setSelectedTagIds([]);
    }
  }, [user, refreshProjects]);

  useEffect(() => {
    if (activeProject) {
      refreshTags();
      refreshNotes();
    } else {
      setTags([]);
      setNotes([]);
      setSelectedTagIds([]);
    }
  }, [activeProject, activeMonth, refreshTags, refreshNotes]);

  const toggleTagFilter = (tagId: string): void => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearTagFilters = (): void => {
    setSelectedTagIds([]);
  };

  const openProjectModal = (): void => setIsProjectModalOpen(true);
  const closeProjectModal = (): void => setIsProjectModalOpen(false);

  const openTagModal = (tag: TagResponseDto | null = null): void => {
    setEditingTag(tag);
    setIsTagModalOpen(true);
  };
  const closeTagModal = (): void => {
    setEditingTag(null);
    setIsTagModalOpen(false);
  };

  const openNoteModal = (date?: string, note: NoteResponseDto | null = null): void => {
    setSelectedNoteDate(date ?? null);
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };
  const closeNoteModal = (): void => {
    setSelectedNoteDate(null);
    setEditingNote(null);
    setIsNoteModalOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        tags,
        selectedTagIds,
        toggleTagFilter,
        clearTagFilters,
        activeMonth,
        setActiveMonth,
        notes,
        isLoading,
        refreshProjects,
        refreshTags,
        refreshNotes,
        isProjectModalOpen,
        openProjectModal,
        closeProjectModal,
        isTagModalOpen,
        editingTag,
        openTagModal,
        closeTagModal,
        isNoteModalOpen,
        editingNote,
        selectedNoteDate,
        openNoteModal,
        closeNoteModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
