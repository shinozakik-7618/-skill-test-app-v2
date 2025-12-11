import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData, deleteDataByDate, exportToCSV } from '../utils/storage';
import QuestionCreator from '../components/QuestionCreator';

type TabType = 'stats' | 'data' | 'creator';

interface CategoryStats {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  correctRate: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [statsData, setStatsData] = useState({ tests: 0, questions: 0, correct: 0, rate: 0 });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  useEffect(() => {
    if (activeTab === 'stats') {
      
      try {
        const rawData = localStorage.getItem('testResults');
        
        if (!rawData) {
          const altData = localStorage.getItem('test_results');
          
          if (altData) {
            processTestResults(JSON.parse(altData));
            return;
          }
        } else {
          processTestResults(JSON.parse(rawData));
          return;
        }
        
        setStatsData({ tests: 0, questions: 0, correct: 0, rate: 0 });
        setCategoryStats([]);
        
      } catch (error) {
        console.error('📊 エラー:', error);
        setStatsData({ tests: 0, questions: 0, correct: 0, rate: 0 });
        setCategoryStats([]);
      }
    }
  }, [activeTab]);

  const processTestResults = (results: any[]) => {
    
    let tests = results.length;
    let questions = 0;
    let correct = 0;
    
    // カテゴリ別の統計を集計
    const categoryMap = new Map<string, { total: number; correct: number }>();
    
    results.forEach((r: any) => {
      const total = r.total || 0;
      const score = r.score || 0;
      questions += total;
      correct += score;
      
      // カテゴリ別に集計
      if (r.results && Array.isArray(r.results)) {
        r.results.forEach((result: any) => {
          const category = result.category || '不明';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { total: 0, correct: 0 });
          }
          const stats = categoryMap.get(category)!;
          stats.total++;
          if (result.isCorrect) {
            stats.correct++;
          }
        });
      }
    });
    
    const rate = questions > 0 ? Math.round((correct / questions) * 100) : 0;
    
    setStatsData({ tests, questions, correct, rate });
    
    // カテゴリ別統計を配列に変換してソート
    const catStats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalQuestions: data.total,
      correctAnswers: data.correct,
      correctRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }));
    
    // 正解率でソート（高い順）
    catStats.sort((a, b) => b.correctRate - a.correctRate);
    setCategoryStats(catStats);
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleClearAllData = () => clearAllData();
  const handleDeleteByDate = () => {
    if (!selectedDate) {
      alert('削除する日付を選択してください。');
      return;
    }
    deleteDataByDate(new Date(selectedDate));
  };
  const handleExportCSV = () => {
    try {
      const csvContent = exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `test-results_${dateStr}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`データをエクスポートしました。\nファイル名: ${fileName}`);
    } catch (error) {
      alert('データのエクスポート中にエラーが発生しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">成績管理・データ管理</h1>
            <button onClick={() => navigate('/')} className="text-orange-600 hover:text-orange-700">
              ホームに戻る
            </button>
          </div>
          <div className="flex space-x-1 mt-4">
            <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'stats' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📈 成績管理
            </button>
            <button onClick={() => setActiveTab('data')} className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'data' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📊 データ管理
            </button>
            <button onClick={() => setActiveTab('creator')} className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'creator' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              ✏️ 問題作成
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">テスト実施回数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.tests}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">解答済み問題数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.questions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">正解数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.correct}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">総合正解率</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.rate}%</p>
              </div>
            </div>

            {/* カテゴリ別成績 */}
            {categoryStats.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📚 カテゴリ別成績</h2>
                <div className="space-y-4">
                  {categoryStats.map((stat, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{stat.category}</h3>
                        <span className="text-lg font-bold text-gray-900">{stat.correctRate}%</span>
                      </div>
                      
                      {/* プログレスバー */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all ${getProgressColor(stat.correctRate)}`}
                          style={{ width: `${stat.correctRate}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>正解: {stat.correctAnswers} / {stat.totalQuestions}問</span>
                        <span className={`font-semibold ${
                          stat.correctRate >= 80 ? 'text-green-600' :
                          stat.correctRate >= 60 ? 'text-blue-600' :
                          stat.correctRate >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {stat.correctRate >= 80 ? '優秀' :
                           stat.correctRate >= 60 ? '良好' :
                           stat.correctRate >= 40 ? '要復習' :
                           '要強化'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {statsData.tests === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">まだテスト履歴がありません</p>
                <p className="text-gray-400 text-sm mt-2">ホームから学習を開始してください</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">データエクスポート</h2>
              <button onClick={handleExportCSV} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
                CSVエクスポート
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-red-600">危険な操作</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">特定日付のデータを削除</h3>
                  <div className="flex items-center space-x-4">
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded px-3 py-2" />
                    <button onClick={handleDeleteByDate} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">削除</button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">全データを削除</h3>
                  <button onClick={handleClearAllData} className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">全データ削除</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'creator' && (
          <div className="bg-white rounded-lg shadow p-6">
            <QuestionCreator />
          </div>
        )}
      </div>
    </div>
  );
}
