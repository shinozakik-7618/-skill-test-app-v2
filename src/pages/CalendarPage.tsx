import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getTestResults } from '../utils/storage';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const results = getTestResults();
  
  // 日付ごとのテスト結果を集計
  const resultsByDate = results.reduce((acc, result) => {
    const date = result.testDate.split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, correct: 0, results: [] };
    }
    acc[date].total += 1;
    if (result.isCorrect) {
      acc[date].correct += 1;
    }
    acc[date].results.push(result);
    return acc;
  }, {} as Record<string, { total: number; correct: number; results: any[] }>);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDateResults = selectedDateKey ? resultsByDate[selectedDateKey] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">学習履歴カレンダー</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* 月選択 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              ← 前月
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {format(currentDate, 'yyyy年 M月', { locale: ja })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              次月 →
            </button>
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayResults = resultsByDate[dateKey];
              const hasResults = !!dayResults;
              const accuracy = hasResults ? (dayResults.correct / dayResults.total) * 100 : 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                    !isSameMonth(day, currentDate)
                      ? 'opacity-30'
                      : isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : hasResults
                      ? 'border-green-300 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {format(day, 'd')}
                  </div>
                  {hasResults && (
                    <div className="text-xs mt-1">
                      <div className="text-green-600 font-semibold">
                        {dayResults.correct}/{dayResults.total}
                      </div>
                      <div className="text-gray-600">
                        {accuracy.toFixed(0)}%
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 選択日の詳細 */}
        {selectedDateResults && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📊 {format(selectedDate!, 'yyyy年M月d日', { locale: ja })} の結果
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedDateResults.total}
                </div>
                <div className="text-xs text-gray-600 mt-1">問題数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selectedDateResults.correct}
                </div>
                <div className="text-xs text-gray-600 mt-1">正解数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {((selectedDateResults.correct / selectedDateResults.total) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 mt-1">正答率</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-2">問題一覧</h4>
              {selectedDateResults.results.map((result, index) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg ${
                    result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      {index + 1}. {result.category}
                    </span>
                    <span className="text-lg">
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {result.questionSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
