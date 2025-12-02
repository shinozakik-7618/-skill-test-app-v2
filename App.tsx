import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import CalendarPage from './pages/CalendarPage';
import ReviewPage from './pages/ReviewPage';

import AdminPage from './pages/AdminPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ModeSelectPage from './pages/ModeSelectPage'; // 🆕
import ReviewNotePage from './pages/ReviewNotePage'; // 🆕
import ReviewTestPage from './pages/ReviewTestPage'; // 🆕 復習テスト
import LearningCalendarPage from './pages/LearningCalendarPage'; // 🆕

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mode-select/:category" element={<ModeSelectPage />} /> {/* 🆕 モード選択 */}
          <Route path="/test/:category" element={<TestPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/calendar" element={<LearningCalendarPage />} /> {/* 🆕 学習カレンダー */}
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/review-note" element={<ReviewNotePage />} /> {/* 🆕 復習ノート */}
          <Route path="/review-test/:category" element={<ReviewTestPage />} /> {/* 🆕 復習テスト */}

          <Route path="/admin" element={<AdminPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
