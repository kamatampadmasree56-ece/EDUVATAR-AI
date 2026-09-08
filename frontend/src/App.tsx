import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { ClassroomPage } from './pages/ClassroomPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { CoursesPage } from './pages/CoursesPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthModal } from './pages/AuthModal';
import { useAuthStore } from './store/useAuthStore';

export const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
        <Navbar onOpenAuthModal={() => setIsAuthModalOpen(true)} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teach" element={<ClassroomPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/assessments" element={<AssessmentPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
