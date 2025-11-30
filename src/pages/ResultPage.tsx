import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTestResultsByCategory, getUserStats } from '../utils/storage';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { category, totalQuestions, totalTime } = location.state || {};
  
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // インデックスを選択肢ラベル（A, B, C, D）に変換
  const getAnswerLabel = (index: number): string => {
    const labels = ['A', 'B', 'C', 'D'];
    return labels[index] || String(index);
  };

  useEffect(() => {
    if (!category) {
      navigate('/');
      return;
    }

    // 最新のテスト結果を取得
    const allResults = getTestResultsByCategory(category);
    const latestResults = allResults.slice(-totalQuestions);
    setResults(latestResults);
    
    // 統計情報を取得
    setStats(getUserStats());
  }, [category, totalQuestions, navigate]);

  if (!category || results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">結果を読み込み中...</h2>
        </div>
      </div>
    );
  }

  const correctCount = results.filter(r => r.isCorrect).length;
  const score = (correctCount / totalQuestions) * 100;
  const isPassed = score >= 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">テスト結果</h1>
          <p className="text-sm text-gray-600 mt-1">{category}</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* スコアカード */}
        <div className={`rounded-xl shadow-lg p-8 mb-8 text-center ${
          isPassed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange-400 to-red-500'
        }`}>
          <div className="text-white mb-4">
            <div className="text-6xl mb-4">
              {isPassed ? '🎉' : '💪'}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {isPassed ? 'よくできました！' : 'もう一息！'}
            </h2>
            <p className="text-lg opacity-90">
              {correctCount} / {totalQuestions} 問正解
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
            <div className="text-6xl font-bold text-white mb-2">
              {score.toFixed(0)}点
            </div>
            <div className="text-white text-sm">
              所要時間: {Math.floor(totalTime / 60)}分{totalTime % 60}秒
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        {stats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 あなたの学習状況</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTests}</div>
                <div className="text-xs text-gray-600 mt-1">受験回数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
                <div className="text-xs text-gray-600 mt-1">正解数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.overallAccuracy.toFixed(1)}%</div>
                <div className="text-xs text-gray-600 mt-1">総合正答率</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.totalQuestions}</div>
                <div className="text-xs text-gray-600 mt-1">累計問題数</div>
              </div>
            </div>
          </div>
        )}

        {/* 詳細結果 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📝 詳細結果</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border-2 ${
                  result.isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    問題 {index + 1}
                  </span>
                  <span className={`text-2xl ${result.isCorrect ? '' : ''}`}>
                    {result.isCorrect ? '✅' : '❌'}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {result.questionSummary}
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span>あなたの回答: <span className="font-semibold">{getAnswerLabel(result.userAnswer)}</span></span>
                  <span>正解: <span className="font-semibold">{getAnswerLabel(result.correctAnswer)}</span></span>
                  <span>所要時間: {result.timeSpent}秒</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/')}
            className="bg-white text-gray-700 px-6 py-4 rounded-lg shadow-md hover:shadow-lg font-semibold transition-all"
          >
            🏠 ホームに戻る
          </button>
          <button
            onClick={() => navigate('/review-note')}
            className="bg-orange-500 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg font-semibold transition-all"
          >
            📚 間違えた問題を復習
          </button>
          <button
            onClick={() => navigate('/learning-calendar')}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg font-semibold transition-all"
          >
            📅 学習履歴を確認
          </button>
        </div>
      </main>
    </div>
  );
}
