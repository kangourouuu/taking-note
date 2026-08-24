import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { AuthPage } from "./components/auth/AuthPage";
import { Header } from "./components/layout/Header";
import { FilterBar } from "./components/layout/FilterBar";
import { MonthlyCalendar } from "./components/calendar/MonthlyCalendar";
import { ProjectModal } from "./components/projects/ProjectModal";
import { TagModal } from "./components/tags/TagModal";
import { NoteModal } from "./components/notes/NoteModal";

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Loading workspace...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header />
        <FilterBar />
        <main className="flex-1 bg-zinc-50/40">
          <MonthlyCalendar />
        </main>
        <ProjectModal />
        <TagModal />
        <NoteModal />
      </div>
    </AppProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};
