import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Award } from 'lucide-react';
import { getLearningHistories, getConsecutiveDays, LearningHistory } from '../utils/storage';

export default function LearningCalendarPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<LearningHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setHistory(getLearningHistories());
  }, []);

  const consecutiveDays = getConsecutiveDays();

  // 今月の学習日数と問題数
  const thisMonthHistory = history.filter(h => {
    const date = new Date(h.date);
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  });
  const thisMonthDays = thisMonthHistory.length;
  const thisMonthQuestions = thisMonthHistory.reduce((sum, h) => sum + h.questionCount, 0);

  // カレンダー生成
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendar: (Date | null)[] = [];
    
    // 前月の空白
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push(null);
    }
    
    // 今月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(new Date(year, month, day));
    }

    return calendar;
  };

  const calendar = generateCalendar();

  const getDateHistory = (date: Date): LearningHistory | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return history.find(h => h.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const selectedHistory = selectedDate ? history.find(h => h.date === selectedDate) : null;

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="font-semibold">ホームに戻る</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-7 h-7 mr-2 text-blue-500" />
            学習カレンダー
          </h1>
          <p className="text-sm text-gray-600 mt-1">あなたの学習履歴を見える化</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold opacity-90">連続学習日数</span>
              <Award className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold">{consecutiveDays}</div>
            <div className="text-sm opacity-90 mt-1">日</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold opacity-90">今月の学習日数</span>
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold">{thisMonthDays}</div>
            <div className="text-sm opacity-90 mt-1">日</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold opacity-90">今月の問題数</span>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold">{thisMonthQuestions}</div>
            <div className="text-sm opacity-90 mt-1">問</div>
          </div>
        </div>

        {/* カレンダー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* 月切り替え */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              ← 前月
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </h2>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              次月 →
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-2">
            {calendar.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayHistory = getDateHistory(date);
              const hasLearning = !!dayHistory;
              const today = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    today
                      ? 'border-blue-500 bg-blue-50'
                      : hasLearning
                      ? 'border-green-300 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${selectedDate === date.toISOString().split('T')[0] ? 'ring-4 ring-blue-300' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className={`text-sm font-semibold ${today ? 'text-blue-600' : hasLearning ? 'text-green-700' : 'text-gray-600'}`}>
                      {date.getDate()}
                    </div>
                    {hasLearning && (
                      <div className="text-xs text-green-600 font-bold mt-1">
                        {dayHistory.questionCount}問
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-50 border-2 border-blue-500 rounded mr-2"></div>
              <span className="text-gray-600">今日</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-50 border-2 border-green-300 rounded mr-2"></div>
              <span className="text-gray-600">学習した日</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white border-2 border-gray-200 rounded mr-2"></div>
              <span className="text-gray-600">学習していない日</span>
            </div>
          </div>
        </div>

        {/* 選択日の詳細 */}
        {selectedHistory && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {new Date(selectedHistory.date).toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })} の学習記録
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-700 font-semibold mb-1">問題数</div>
                <div className="text-2xl font-bold text-blue-900">{selectedHistory.questionCount}問</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-700 font-semibold mb-1">正解数</div>
                <div className="text-2xl font-bold text-green-900">{selectedHistory.correctCount}問</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-700 font-semibold mb-1">正答率</div>
                <div className="text-2xl font-bold text-purple-900">{selectedHistory.correctRate.toFixed(1)}%</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 font-semibold mb-2">学習カテゴリー</div>
              <div className="flex flex-wrap gap-2">
                {selectedHistory.categories.map(category => (
                  <span key={category} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
