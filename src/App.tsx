import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import CalendarPage from './pages/CalendarPage';
import ReviewPage from './pages/ReviewPage';
import StatsPage from './pages/StatsPage';
import AdminPage from './pages/AdminPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test/:category" element={<TestPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
