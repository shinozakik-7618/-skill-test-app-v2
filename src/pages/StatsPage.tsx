import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats, exportToCSV } from '../utils/storage';

export default function StatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(getUserStats());
  }, []);

  const handleExportCSV = () => {
    try {
      const csv = exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `test_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('CSVファイルをダウンロードしました');
    } catch (error) {
      alert('エクスポートに失敗しました');
      console.error(error);
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">成績管理</h1>
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
        {/* 総合統計 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📊 総合成績</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalTests}
              </div>
              <div className="text-sm text-gray-600">受験回数</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">総問題数</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">正解数</div>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {stats.overallAccuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">総合正答率</div>
            </div>
          </div>

          {stats.lastTestDate && (
            <p className="text-sm text-gray-600 text-center">
              最終受験日: {new Date(stats.lastTestDate).toLocaleString('ja-JP')}
            </p>
          )}
        </div>

        {/* カテゴリー別統計 */}
        {Object.keys(stats.categoryStats).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📚 カテゴリー別成績
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.categoryStats)
                .sort((a: any, b: any) => b[1].accuracy - a[1].accuracy)
                .map(([category, data]: [string, any]) => (
                  <div key={category} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{category}</h3>
                      <span className={`text-lg font-bold ${
                        data.accuracy >= 70 ? 'text-green-600' :
                        data.accuracy >= 50 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {data.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>正解: {data.correct}問</span>
                      <span>全体: {data.total}問</span>
                    </div>
                    {/* プログレスバー */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          data.accuracy >= 70 ? 'bg-green-500' :
                          data.accuracy >= 50 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${data.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* アクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg font-semibold transition-all flex items-center justify-center"
          >
            <span className="text-2xl mr-2">📥</span>
            CSV形式でエクスポート
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg font-semibold transition-all flex items-center justify-center"
          >
            <span className="text-2xl mr-2">📅</span>
            学習履歴を見る
          </button>
        </div>

        {/* 学習のヒント */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 学習のヒント</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>正答率70%以上: 素晴らしい理解度です！定期的に復習しましょう</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">⚠</span>
              <span>正答率50-70%: もう少しで完璧です！重点的に復習しましょう</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2">✗</span>
              <span>正答率50%未満: 基礎から見直すことをお勧めします</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
