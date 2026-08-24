import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Folder, Tag as TagIcon, Check } from "lucide-react";

export const FilterBar: React.FC = () => {
  const {
    projects,
    activeProject,
    setActiveProject,
    tags,
    selectedTagIds,
    toggleTagFilter,
    clearTagFilters,
    activeMonth,
    setActiveMonth,
    openProjectModal,
    openTagModal
  } = useApp();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState<boolean>(false);

  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = (): void => {
    const [year, month] = activeMonth.split("-").map(Number);
    if (!year || !month) return;
    const prevDate = new Date(year, month - 2, 1);
    const newYear = prevDate.getFullYear();
    const newMonth = String(prevDate.getMonth() + 1).padStart(2, "0");
    setActiveMonth(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = (): void => {
    const [year, month] = activeMonth.split("-").map(Number);
    if (!year || !month) return;
    const nextDate = new Date(year, month, 1);
    const newYear = nextDate.getFullYear();
    const newMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
    setActiveMonth(`${newYear}-${newMonth}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.value) {
      setActiveMonth(e.target.value);
    }
  };

  return (
    <div className="bg-zinc-50 border-b border-zinc-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" ref={projectDropdownRef}>
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-900 hover:border-zinc-300 shadow-sm transition-colors min-w-[180px] justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <Folder className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="truncate">
                  {activeProject ? activeProject.name : "Select Project"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl shadow-lg z-40 py-1 overflow-hidden">
                <div className="max-h-56 overflow-y-auto">
                  {projects.length === 0 ? (
                    <div className="px-3 py-2.5 text-xs text-zinc-500 text-center">
                      No projects found
                    </div>
                  ) : (
                    projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          setActiveProject(proj);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                          activeProject?.id === proj.id
                            ? "bg-zinc-100 font-semibold text-black"
                            : "hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        <span className="truncate">{proj.name}</span>
                        {activeProject?.id === proj.id && (
                          <Check className="w-4 h-4 text-black shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-100 p-1 bg-zinc-50">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      openProjectModal();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-zinc-900 hover:bg-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Project...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={tagDropdownRef}>
            <button
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-900 hover:border-zinc-300 shadow-sm transition-colors min-w-[170px] justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <TagIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="truncate">
                  {selectedTagIds.length === 0
                    ? "Filter by Tags"
                    : `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? "s" : ""} active`}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            </button>

            {isTagDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl shadow-lg z-40 py-1 overflow-hidden">
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Tags Filter
                  </span>
                  {selectedTagIds.length > 0 && (
                    <button
                      onClick={clearTagFilters}
                      className="text-xs text-zinc-600 hover:text-black font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto">
                  {tags.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-zinc-500 text-center">
                      No tags created yet
                    </div>
                  ) : (
                    tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTagFilter(tag.id)}
                          className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                            isSelected ? "bg-zinc-100 text-black font-medium" : "hover:bg-zinc-50 text-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                              style={{ backgroundColor: tag.colorHex }}
                            />
                            <span className="truncate">{tag.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-zinc-100 p-1 bg-zinc-50">
                  <button
                    onClick={() => {
                      setIsTagDropdownOpen(false);
                      openTagModal(null);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-zinc-900 hover:bg-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Tag...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-zinc-100 text-zinc-700 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="month"
            value={activeMonth}
            onChange={handleMonthChange}
            className="px-2 py-0.5 text-xs font-semibold text-zinc-800 bg-transparent focus:outline-none cursor-pointer"
          />

          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-zinc-100 text-zinc-700 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
